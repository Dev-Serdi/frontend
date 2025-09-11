import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { Dropdown, Badge } from "react-bootstrap";
import { FaBell, FaTrash } from "react-icons/fa";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "../../styles/NotificationBell.css";
import { getAuthToken } from "../../services/AuthService";
import { toast } from "sonner";
import { fetchNotifications, markNotificationAsSeen, deleteAllNotificationsForUser } from "../../services/NotificationService";
import { getUserId } from "../../services/UsuarioService";
import { useNavigate } from "react-router-dom";

const WEBSOCKET_URL = import.meta.env.VITE_WS_BASE_URL;

const NotificationBell = () => {
  const { accounts } = useMsal();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const stompClientRef = useRef(null);
  const userEmail = accounts[0]?.username || "";
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/notifications/readed");
  };

  const handleSeenNotification = useCallback(async (notificationId) => {
    try {
      await markNotificationAsSeen(notificationId);
      // Actualiza el estado local para que la notificación desaparezca si es necesario
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error al marcar la notificacion como leida", error);
    }
  }, []);

  const fetchUserNotifications = useCallback(async () => {
    try {
      const user = await getUserId();
      setUserId(user.data);
      const response = await fetchNotifications(user.data);
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.readed).length); // Corregido a 'readed'
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchUserNotifications();
    }
  }, [userEmail, fetchUserNotifications]);
  
  // Lógica de WebSocket (sin cambios)...
  useEffect(() => {
    if (!userEmail || !userId) return;

    const authToken = getAuthToken();
    if (!authToken) {
      console.error("No se pudo obtener el token de autenticación.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: { Authorization: `Bearer ${authToken}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        stompClientRef.current = client;
        const userDestination = `/user/${userEmail}/notifications`;
        client.subscribe(userDestination, (message) => {
          const newNotification = JSON.parse(message.body);
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast.info(newNotification.title, {
            description: newNotification.body,
            action: {
              label: "Ver",
              onClick: () => navigate(newNotification.url),
            },
          });
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => console.error("Error STOMP:", frame.headers.message || frame.body),
    });

    client.activate();

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    };
  }, [userEmail, userId, navigate]);

  // *** FUNCIÓN DE BORRADO MEJORADA ***
  const deleteAllNotifications = async () => {
    if (!window.confirm("¿Estás seguro de que quieres marcar todas las notificaciones como leídas?")) {
        return;
    }

    const originalNotifications = [...notifications]; // Guarda el estado actual por si falla
    
    // 1. Actualización optimista: limpia la UI inmediatamente
    setNotifications([]);
    setUnreadCount(0);

    try {
        // 2. Llama a la nueva API para eliminar en el backend
        await deleteAllNotificationsForUser(userId);
    } catch (error) {
        console.error("Error al eliminar todas las notificaciones:", error);
        toast.error("No se pudieron eliminar las notificaciones. Inténtalo de nuevo.");
        // 3. Si falla, restaura el estado anterior
        setNotifications(originalNotifications);
        setUnreadCount(originalNotifications.filter(n => !n.readed).length);
    }
  };

  return (
    <Dropdown onToggle={() => unreadCount > 0 && setUnreadCount(0)}>
      <Dropdown.Toggle as="button" className="notification-bell-button">
        <FaBell className="bell" style={{ color: isConnected ? 'inherit' : '#999' }} />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown">
        <Dropdown.Header>
          Notificaciones
          {notifications.length > 0 && ( // Muestra el botón solo si hay notificaciones
            <button 
              className="btn btn-sm btn-outline-danger" 
              style={{ float: "right" }} 
              onClick={deleteAllNotifications}
              title="Eliminar todas las notificaciones"
            >
              <FaTrash />
            </button>
          )}
        </Dropdown.Header>
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Dropdown.Item
              key={notif.id}
              onClick={() => {
                handleSeenNotification(notif.id);
                navigate(notif.url);
              }}
            >
              <strong>{notif.title}</strong>
              <div>{notif.body}</div>
              <small className="text-muted">
                {new Date(notif.timestamp).toLocaleString()}
              </small>
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.ItemText>
            No tienes notificaciones nuevas.
          </Dropdown.ItemText>
        )}
        <Dropdown.Divider />
        <div style={{ padding: "8px 12px" }}>
          <button
            className="btn btn-outline-primary w-100"
            onClick={handleNavigation}
          >
            Ver todas las notificaciones
          </button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;