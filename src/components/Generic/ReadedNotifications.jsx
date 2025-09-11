import React, { useState, useEffect, useCallback, Fragment } from "react";
import { getUserId } from "../../services/UsuarioService";
import { fetchAllNotifications, markNotificationAsSeen } from "../../services/NotificationService"; // Asumimos que esta función será creada
import { Transition } from "@headlessui/react";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// Función para formatear fechas de forma relativa (ej. "hace 2 horas")
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "hace unos segundos";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${days} días`;
};


export const ReadedNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigate();

  
  // Estado para la paginación
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // 1. Obtener el userId una sola vez al montar el componente
  useEffect(() => {
    getUserId()
      .then(response => setUserId(response.data))
      .catch(err => {
        console.error("Error al obtener el userId", err);
        setError("No se pudo identificar al usuario.");
        setLoading(false);
      });
  }, []);

  // 2. Cargar notificaciones cuando cambien userId, page o size
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllNotifications(userId, page, size);
      
      setNotifications(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error al obtener las notificaciones:", error);
      setError("No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }, [userId, page, size]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0); // Reset page to 0 when size changes
  };

  const handleClick = (id) =>{
    handleSeenNotification(id);
  }

  const handleSeenNotification = useCallback(async (notificationId) => {
      try {
        await markNotificationAsSeen(notificationId);
      } catch (error) {
        console.error ("Error al marcar la notificacion como leida", error)
      }
    }, []);

  return (
    <div className=" mx-auto p-1 sm:p-6 lg:p-8">
      <Transition
        show={true}
        as={Fragment}
        appear
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        <div className="container bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaBell className="mr-3 text-indigo-500" />
                Historial de Notificaciones
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Aquí puedes ver todas tus notificaciones, leídas y no leídas.
              </p>
            </div>
            <div className="flex items-center mt-3 sm:mt-0">
              <label htmlFor="size-select" className="text-sm font-medium text-gray-700 mr-2">Mostrar:</label>
              <select
                id="size-select"
                value={size}
                onChange={handleSizeChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-full p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="text-center p-10">
                <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-800">Error al Cargar</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button onClick={fetchNotifications} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reintentar</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-10">
                <FaBell className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Sin notificaciones</h3>
                <p className="mt-1 text-sm text-gray-500">No tienes ninguna notificación en tu historial.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notif, index) => (
                  <Transition
                    key={notif.id}
                    as="li"
                    show={true}
                    appear
                    enter="transition-all duration-300 ease-out"
                    enterFrom="opacity-0 -translate-x-5"
                    enterTo="opacity-100 translate-x-0"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Link to={notif.url} onClick={() => handleClick(notif.id)} className="block hover:bg-gray-50 p-1 sm:p- text-decoration-none">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FaCheckCircle className={`h-6 w-6 ${notif.readed ? 'text-gray-400' : 'text-green-500'}`} />
                        </div>
                        <div className="m-1 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{notif.title}, 
                          <span className="text-sm text-gray-600"> {notif.body} - </span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(notif.timestamp)}</span>

                          </p>
                        </div>
                      </div>
                    </Link>
                  </Transition>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-gray-50 border-t flex justify-center items-center space-x-4">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                <FaChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                <FaChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </Transition>
    </div>
  );
};