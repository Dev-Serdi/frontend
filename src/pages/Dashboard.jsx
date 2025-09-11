import React, { useEffect, useState } from "react";
import "../styles/index.css";
import { LiaUserAstronautSolid } from "react-icons/lia";
import { Button, Transition } from "@headlessui/react";
import {
  FaRegHandPeace,
  FaUserPlus,
  FaSignInAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import { UseLoginHandler } from "../components/MicrosoftAuth/ButtonHandler";
import { MicrosoftSignUp } from "../components/MicrosoftAuth/SignupButton";
import CreateTicket from "../components/Ticket/modal/CreateTicket";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { useAuth } from "../components/AuthContext";
import { getUserId, getUserRoles } from "../services/UsuarioService";
import { listTicketsDashboard } from "../services/TicketService";
import { LoadingSpinner } from "./LoadingSpinner";
import { formatDate, getPriorityLabel, getStatusLabel } from "../utils/utils";
import { GiOpenBook } from "react-icons/gi";
import { BsFillPassFill } from "react-icons/bs";

const Dashboard = () => {
  return (
    <>
      <div className="App">
        <AuthenticatedTemplate>
          <ProfileContent />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <AuthPrompt />
        </UnauthenticatedTemplate>
      </div>
    </>
  );
};

const AuthPrompt = () => {
  const { handleLogin } = UseLoginHandler();
  const { handleSignUp } = MicrosoftSignUp();
  return (
    <>
      <Transition
        as="div"
        appear
        show
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        className="max-w-md mx-auto mt-5 bg-white rounded-xl shadow-md overflow-hidden space-y-4 p-3"
      >
        <div className="flex items-center space-x-2 text-primary-600">
          <FaRegHandPeace className="w-6 h-6 flex-shrink-0" />
          <h2 className="text-2xl font-bold">
            ¡Bienvenido a nuestra plataforma!
          </h2>
        </div>
        <p className="text-gray-600">
          ¡Gestiona los tickets de soporte y accede a todos nuestros recursos!
        </p>

        <div className="space-y-3">
          <Link
            onClick={handleSignUp}
            className="mb-4 text-decoration-none flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors group"
          >
            <FaUserPlus className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            <span className="p-2 font-medium text-gray-700 group-hover:text-primary-700">
              Crear nueva cuenta
            </span>
          </Link>

          <Link
            onClick={handleLogin}
            className="mb-4 text-decoration-none flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors group"
          >
            <FaSignInAlt className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            <span className="p-2 font-medium text-gray-700 group-hover:text-primary-700">
              Acceder a mi cuenta
            </span>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          ¿Necesitas ayuda?{" "}
          <a
            target="_blank"
            href="https://ab.serdi.com.mx/shelves/plataforma-de-soporte-y-gestion-documental"
            className="text-decoration-none text-primary-600 hover:text-primary-700 underline"
          >
            Consulta nuestra guía rápida
          </a>
        </p>
      </Transition>
    </>
  );
};

const ProfileContent = () => {
  const { user } = useAuth();  
  const [userId, setUserId] = useState(null);
  const [roles, setRoles] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState(0); // Nuevo estado para el filtro
  const [pagination, setPagination] = useState({
    currentPage: 0,
    itemsPerPage: 5,
    totalPages: 0,
    totalItems: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
        if (user?.username) {
          setLoading(true);
          try {
            const [userIdRes, rolRes] = await Promise.all([
              getUserId(user.username),
              getUserRoles(),
            ]);
            const fetchedUserId = userIdRes.data;
            setUserId(fetchedUserId);
            setRoles(rolRes.data)            
            // Ahora obtenemos los tickets con el userId y el filtro de estado
            const ticketsResponse = await listTicketsDashboard(
              fetchedUserId,
              pagination.currentPage,
              pagination.itemsPerPage,
              estadoFiltro 
            );
            setTickets(ticketsResponse.data.content);
            setPagination((prev) => ({
              ...prev,
              totalPages: ticketsResponse.data.totalPages,
              totalItems: ticketsResponse.data.totalElements,
            }));
            
          } catch (error) {
            console.error("Error fetching datos:", error);
          } finally {
            setLoading(false);
          }
        } else {
          setUserId(null);
          setTickets([]);
          setLoading(false);
        }
    };
    fetchData();
  }, [user, pagination.currentPage, pagination.itemsPerPage, estadoFiltro]); // <-- Agrega estadoFiltro como dependencia

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleItemsPerPageChange = (e) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: parseInt(e.target.value),
      currentPage: 0,
    }));
  };

  const handleEstadoFiltroChange = (e) => {
    setEstadoFiltro(Number(e.target.value));
    setPagination((prev) => ({
      ...prev,
      currentPage: 0,
    }));
  };

  if (!userId && loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-content-evenly items-center">
        <div className="flex w-90 bg-blue-950 m-2 p-1 justify-center rounded-full"></div>
        <div className="flex w-90 bg-blue-950 m-2 p-1 justify-center rounded-full"></div>
      </div>

      <div className="flex flex-row justify-content-evenly items-center flex-wrap">
        {roles === "ROLE_USER" ? (
        <Button
          onClick={() => setOpenDialog(true)}
          className="flex w-90 min-h-30 h-fit bg-white m-2 p-1 justify-center rounded text-decoration-none text-black hover:shadow-md transition-shadow"
        >
          <div className="flex flex-row w-80 row-auto">
            <div className="row-1 mt-auto mb-auto pt-3">
              <LiaUserAstronautSolid className="fs-1 text-blue-600" />
            </div>
            <div className="row-2 p-1">
              <h4 className="text-lg font-semibold">Generar ticket</h4>
              <div className="border-l-blue-900 border-l-3 p-1 text-sm">
                Describe tu problema rellenando el formulario de soporte.
              </div>
            </div>
          </div>
        </Button>

        ) : (
          <Link
          to="/helpdesk/mytickets"
          className="flex w-90 min-h-30 h-fit bg-white m-2 p-1 justify-center rounded text-decoration-none text-black hover:shadow-md transition-shadow"
        >
          <div className="flex flex-row w-80 row-auto">
            <div className="row-1 mt-auto mb-auto pt-3">
              <BsFillPassFill className="fs-1 text-blue-600" />
            </div>
            <div className="row-2 p-1">
              <h4 className="text-lg font-semibold">Mesa de ayuda</h4>
              <div className="border-l-blue-900 border-l-3 p-1 text-sm text-center">
                Accede a la gestión de tickets y consulta tus tickets asignados.
              </div>
            </div>
          </div>
        </Link>
        )
      }

        <Link
          to="/knowledge/home"
          className="flex w-90 min-h-30 h-fit bg-white m-2 p-1 justify-center rounded text-decoration-none text-black hover:shadow-md transition-shadow"
        >
          <div className="flex flex-row w-80 row-auto">
            <div className="row-1 mt-auto mb-auto pt-3">
              <GiOpenBook className="fs-1 text-blue-600" />
            </div>
            <div className="row-2 p-1">
              <h4 className="text-lg font-semibold">Gestión documental</h4>
              <div className="border-l-blue-900 border-l-3 p-1 text-sm text-center">
                Sube tus evidencias de gestion gerencial y consulta los
                documentos disponibles.
              </div>
            </div>
          </div>
        </Link>

        <CreateTicket
          open={openDialog}
          setOpen={setOpenDialog}
          onTicketCreated={() => Navigate("/dashboard")}
        />
      </div>

      {/* SECCIÓN DE TICKETS DEL USUARIO */}
      <div className="mx-4">
          <h3 className="text-xl font-bold text-gray-800">Mis Tickets</h3>
        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Mostrar:</span>
              <select 
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-white border rounded px-2 py-1 text-sm m-2"
                disabled={loading}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            {/* Filtro de estado */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Estado:</span>
              <select
                value={estadoFiltro}
                onChange={handleEstadoFiltroChange}
                className="border bg-white m-2 rounded px-2 py-1 text-sm"
                disabled={loading}
              >
                <option value={0}>Todos</option>
                <option value={1}>En proceso</option>
                <option value={2}>Completados</option>
                <option value={3}>Cerrados</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              No hay datos para mostrar
            </p>
            <Button
              onClick={() => setOpenDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Crear mi primer ticket
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      ID
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Título
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Fecha de creación
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Fecha de expiración
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Prioridad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        #{ticket.id}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/helpdesk/task/${ticket.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-decoration-none"
                        >
                          {ticket.tema}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            ticket.estado === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.estado === 2
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                              // : ticket.estado === 3 && ticket?.isAuthorized 
                              // ? "bg-gray-100 text-gray-800"
                              // : "bg-red-100 text-red-800"                              
                          }`}
                        >
                          {getStatusLabel(ticket.estado, ticket?.isAuthorized)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(ticket.fechaCreacion)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(ticket.fechaVencimiento)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            ticket.prioridad === 1
                              ? "bg-red-100 text-red-800"
                              : ticket.prioridad === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {getPriorityLabel(ticket.prioridad)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                Mostrando {Math.min(pagination.itemsPerPage, tickets.length)} de{" "}
                {pagination.totalItems} tickets
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className={`p-2 rounded ${
                    pagination.currentPage === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FaChevronLeft />
                </button>

                <div className="flex space-x-1 mx-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageIndex =
                      Math.max(0, Math.min(pagination.totalPages - 5, pagination.currentPage - 2)) +
                      i;

                    if (pageIndex < pagination.totalPages) {
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => handlePageChange(pageIndex)}
                          className={`px-3 py-1 rounded ${
                            pagination.currentPage === pageIndex
                              ? "bg-blue-500 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageIndex + 1}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className={`p-2 rounded ${
                    pagination.currentPage >= pagination.totalPages - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
        <div className="m-4"></div>
      </div>
    </>
  );
};

export default Dashboard;
