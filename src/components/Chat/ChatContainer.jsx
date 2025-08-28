// C:/react/Proyecto/frontend/src/components/Chat/ChatContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ChatComponent from "./ChatComponent"; // Asegúrate de que la ruta sea correcta
import { listMessages, postChatMessage } from "../../services/ChatService";
// Importa tu hook de autenticación para obtener el usuario actual
import { getUserId } from "../../services/UsuarioService"; // Ajusta la ruta a tu AuthContext
import { toast } from "sonner"; // Para notificaciones
import { getAuthToken as getTokenFromAuthService } from "../../services/AuthService.js"; // Importa y renombra

// --- Configuración WebSocket ---
const WEBSOCKET_URL = import.meta.env.VITE_WS_BASE_URL;
const CHAT_SUB_TOPIC_PREFIX = "/ticket/chat/"; // Prefijo del topic de suscripción

const ChatContainer = ({ ticketId, chatId, estadoId}) => {
  const [user, setUser] = useState(null); // Obtén el usuario actual del contexto
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [closedTicket, setClosedTicket] = useState(null);

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Cargar mensajes históricos
  const loadChatHistory = useCallback(async () => {
    if (!ticketId) {
      setIsLoadingMessages(false);
      return;
    }
    setIsLoadingMessages(true);
    setConnectionError(null);
    try {
      const response = await listMessages(ticketId);
      if (response.data?.content) {
        const sortedMessages = response.data.content.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      const errorMsg =
        error.response?.data?.message || "Error al cargar el historial.";
      setConnectionError(errorMsg);
      toast.error(errorMsg);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [ticketId]);

  // Configurar y gestionar conexión WebSocket
  useEffect(() => {
    getUserId().then((response) => {
      setUser(response.data);
    });
    if (!chatId || !ticketId || stompClientRef.current?.active) {
      if (!chatId && ticketId && !isLoadingMessages && !isConnecting) {
        setConnectionError("ID de chat no disponible para este ticket.");
        setIsConnected(false);
        setIsConnecting(false);
      }
      return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);
    const authTokenString = getTokenFromAuthService(); // Obtener el token string
    
    if (!authTokenString) {
      console.error(
        "ChatContainer: No se pudo obtener el token de autenticación para WebSocket."
      );
      setConnectionError("Autenticación requerida para el chat.");
      setIsConnecting(false);
      setIsConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${authTokenString}`, // Usar el token string directamente
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        stompClientRef.current = client;

        const topic = `${CHAT_SUB_TOPIC_PREFIX}${chatId}`;
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
        loadChatHistory();
        if (estadoId === 3) {
          setIsConnected(false);
          setIsConnecting(false);
          setClosedTicket("El ticket se encuentra cerrado.");
          return;
        }
        subscriptionRef.current = client.subscribe(
          topic,
          (message) => {
            try {
              const receivedMessage = JSON.parse(message.body);
              
              setMessages((prevMessages) => {
                if (prevMessages.some((msg) => msg.id === receivedMessage.id)) {
                  return prevMessages;
                }
                const newMessages = [...prevMessages, receivedMessage];
                return newMessages.sort(
                  (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );
              });
            } catch (e) {
              console.error(
                "ChatContainer: Error parseando mensaje STOMP:",
                e,
                message.body
              );
              toast.error("Error al procesar mensaje recibido.");
            }
          },
          { id: `sub-chat-${chatId}` }
        );
        
      },
      onDisconnect: (frame) => {
        setIsConnected(false);
        setIsConnecting(false);
        if (stompClientRef.current) {
          // Evitar mensaje de error en desmontaje intencional
          setConnectionError("Chat desconectado. Intentando reconectar...");
        }
        stompClientRef.current = null;
        subscriptionRef.current = null;
      },
      onStompError: (frame) => {
        console.error("ChatContainer: Error STOMP:", frame);
        setIsConnected(false);
        setIsConnecting(false);
        const errorMsg =
          frame.headers["message"] || frame.body || "Error STOMP desconocido.";
        setConnectionError(`Error STOMP: ${errorMsg}`);
        toast.error(`Error de chat (STOMP): ${errorMsg}`);
      },
      onWebSocketError: (event) => {
        console.error("ChatContainer: Error de WebSocket:", event);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(
          "Error de conexión WebSocket. Intentando reconectar..."
        );
      },
    });
    
    client.activate();
    

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
      subscriptionRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(null);
    };
  }, [ticketId, chatId, loadChatHistory]); // No es necesario getTokenFromAuthService si es estable

  // Función para enviar mensajes (llamada por ChatComponent)
  const handleSendMessage = useCallback(
    async (messageContent, files) => {
      if (estadoId === 3) {
        alert("El ticket se encuentra cerrado.");
        return;
      }
      if (
        !isConnected ||
        (!messageContent.trim() && (!files || files.length === 0))
      ) {
        toast.warn("Conéctate o escribe un mensaje para enviar.");
        return;
      }
      if (!ticketId) {
        toast.error("Error: ID de ticket no disponible.");
        return;
      }

      const fileToSend = files && files.length > 0 ? files[0] : null;

      try {
        // postChatMessage en ChatService.js ya debe manejar la autenticación
        // El backend espera ChatMessageCreateDto que solo tiene 'content'.
        // El 'ticketId' va en la URL. El 'file' se maneja como Multipart.
        await postChatMessage(ticketId, messageContent, fileToSend);
        // No es necesario enviar un mensaje STOMP aquí. El backend lo hace.
        // ChatComponent limpiará sus inputs si esta promesa se resuelve.
      } catch (error) {
        console.error("ChatContainer: Error enviando mensaje HTTP:", error);
        const errorMsg =
          error.response?.data?.message || "Fallo al enviar el mensaje.";
        // No actualices connectionError aquí, ya que es un error de envío, no de conexión general.
        toast.error(errorMsg);
        throw error; // Re-lanzar para que ChatComponent sepa que falló y no limpie los inputs
      }
    },
    [isConnected, ticketId]
  );

  return (
    <ChatComponent
      messages={messages}
      onSendMessage={handleSendMessage}
      isConnected={isConnected}
      isConnecting={isConnecting}
      isLoadingMessages={isLoadingMessages}
      currentUserId={user}
      connectionError={connectionError}
      closedTicket={closedTicket}
    />
  );
};

export default ChatContainer;