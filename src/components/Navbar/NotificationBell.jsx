import React, { useState, useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { Dropdown, Badge} from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "../../styles/NotificationBell.css";
import { getAuthToken } from "../../services/AuthService";
import { toast } from "sonner";
import { fetchNotifications, markNotificationAsSeen } from "../../services/NotificationService";
import { getUserId } from "../../services/UsuarioService";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const WEBSOCKET_URL = import.meta.env.VITE_WS_BASE_URL;

const NotificationBell = () => {
  const { accounts } = useMsal();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const userEmail = accounts[0]?.username || "";
  const navigation = useNavigate();

  const handleNavigation = (()=>
  {
    navigation("/notifications/readed")
  })

  const handleSeenNotification = useCallback(async (notificationId) => {
    try {
      await markNotificationAsSeen(notificationId);
    } catch (error) {
      console.error ("Error al marcar la notificacion como leida", error)
    }
  }, []);

  // Renombrar la función interna para evitar conflicto
  const fetchUserNotifications = useCallback(async () => {
    try {
      const user = await getUserId();
      const userId = user.data;
      const response = await fetchNotifications(userId);
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
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

  useEffect(() => {
    if (!userEmail) return;

    const authToken = getAuthToken();
    if (!authToken) {
      console.error("No se pudo obtener el token de autenticación.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        stompClientRef.current = client;

        // Suscripción personalizada por usuario
        const userDestination = `/user/${userEmail}/notifications`;
        
        client.subscribe(userDestination, (message) => {
          try {
            const newNotification = JSON.parse(message.body);
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.info(newNotification.title, {
              description: newNotification.body,
              action: {
                label: "Ver",
                onClick: () => window.location.href = newNotification.url
              }
            });
          } catch (e) {
            console.error("Error procesando notificación:", e, message.body);
          }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error("Error STOMP:", frame.headers.message || frame.body);
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        console.error("Error WebSocket:", event);
        setIsConnected(false);
      },
    });

    client.activate();

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    }
  }, [userEmail]);

  const handleDropdownToggle = () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  return (
    <Dropdown onToggle={handleDropdownToggle}>
      <Dropdown.Toggle as="button" className="notification-bell-button">
        <FaBell className="bell" style={{ color: isConnected ? 'inherit' : '#999' }} />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown">
        <Dropdown.Header>Notificaciones</Dropdown.Header>
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Dropdown.Item
            key={notif.id}
            href={notif.url}
            onClick={() => handleSeenNotification(notif.id)}
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
        <Dropdown.Divider/>
        <div
          style={{
            position: "sticky",
            left: 0,
            right: 0,
            bottom: -10,
            padding: "12px",
            background: "#fff",
            borderTop: "1px solid #eee",
            zIndex: 10,
            textAlign: "center"
          }}
        >
          <button
            className="btn btn-outline-primary w-100"
            style={{ fontWeight: "bold" }}
            onClick={handleNavigation}
          >
            Ver notificaciones leídas
          </button>
        </div>
      </Dropdown.Menu>
      <Dropdown.Divider />
    </Dropdown>
  );
};

export default NotificationBell;