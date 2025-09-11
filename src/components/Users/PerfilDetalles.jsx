import React, { Fragment, memo, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  getUserById,
  getUserRoles,
  login,
} from "../../services/UsuarioService";
import { Link, useParams } from "react-router-dom";
import { listTicketsByUser } from "../../services/TicketService";
import { PaginationControl } from "../Generic/PaginationControl";
import { Transition } from "@headlessui/react";
import {
  FaBriefcase,
  FaClock,
  FaDesktop,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTicketAlt,
} from "react-icons/fa";
import {
  formatDate,
  formatUserRole,
  getCierre,
  getPriorityLabel,
  getStatusLabel,
} from "../../utils/utils";
import { FaPencil } from "react-icons/fa6";
import { getIpByUserId } from "../../services/IpService";

export const PerfilDetalles = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketTotalPages, setTicketTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState(0);
  const [currentUserRoles, setCurrentUserRoles] = useState([]);
  const itemsPerPage = 5;

  // Estado para accesos IP
  const [ipAccesses, setIpAccesses] = useState([]);
  const [ipLoading, setIpLoading] = useState(true);
  const [ipPage, setIpPage] = useState(1);
  const [ipTotalPages, setIpTotalPages] = useState(0);
  const ipPageSize = 4;

  // Obtiene los roles del usuario actual solo una vez al renderizar el componente padre
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getUserRoles();
        setCurrentUserRoles(res.data || []);
      } catch (error) {
        setCurrentUserRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // Fetch IP accesses con paginación
  useEffect(() => {
    const fetchIp = async () => {
      setIpLoading(true);
      try {
        const response = await getIpByUserId(id, ipPage - 1, ipPageSize);
        setIpAccesses(response.data.content || []);
        setIpTotalPages(response.data.totalPages || 0);
      } catch (error) {
        console.error(error);
        
        setIpAccesses([]);
      } finally {
        setIpLoading(false);
      }
    };
    fetchIp();
  }, [id, ipPage]);


  const fetchTickets = useCallback(async () => {
    try {
      const ticketRes = await listTicketsByUser(
        id,
        ticketPage - 1,
        itemsPerPage,
        statusFilter
      );
      setTickets(ticketRes.data.content);
      setTicketTotalPages(ticketRes.data.totalPages);
    } catch (error) {
      console.error("Error al cargar tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [id, ticketPage, statusFilter]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const userRes = await getUserById(id);
      setUsuario(userRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setTicketPage(1);
  }, [statusFilter]);

  if (loading) return <PageLoader text="Cargando perfil..." />;

  return (
    <Transition
      as={Fragment}
      appear={true}
      show={true}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className="flex flex-col"
    >
      <div className="mx-auto p-2 sm:p-5 lg:p-5 space-y-5">
        {usuario && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <UserInfoCard
                usuario={usuario}
                isAdmin={currentUserRoles.includes("ROLE_ADMIN")}
              />
            </div>
            <div className="flex-1">
              <IpAccessCard
                accesses={ipAccesses}
                loading={ipLoading}
                currentPage={ipPage}
                totalPages={ipTotalPages}
                onPageChange={setIpPage}
                pageSize={ipPageSize}
              />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto min-h-100 rounded-xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-4 ">
            <div className="p-2 border-b border-gray-200 flex flex-col sm:flex-row justify-around items-center">
              <h2 className="text-center text-2xl font-bold text-gray-800 flex items-end justify-end">
                <FaTicketAlt className="mr-3 text-green-500" />
                <span>
                  Tickets de asignados a:{" "}
                  <span className="text-2xl font-semibold">
                    {usuario?.nombre} {usuario?.apellido}
                  </span>
                </span>
              </h2>
              {/* Filtro de Estado */}
              <div>
                <label htmlFor="status-filter" className="sr-only">
                  Filtrar por estado
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-100"
                >
                  <option value="0">Todos</option>
                  <option value="1">En Proceso</option>
                  <option value="2">Completados</option>
                  <option value="3">Cerrados</option>
                </select>
              </div>
            </div>
            <div className="p-2">
              {/* Contenido de la tabla de tickets */}
              <div className="flex flex-col min-h-[350px]">
                {loading ? (
                  <PageLoader text="Cargando tickets..." />
                ) : (
                  <div className="flex-grow overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Tema
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Respuesta
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Creado
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Cerrado
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Prioridad
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-12 text-gray-500"
                            >
                              No se encontraron tickets asignados para este
                              usuario.
                            </td>
                          </tr>
                        ) : (
                          tickets.map((ticket) => (
                            <tr
                              key={ticket.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-3 px-4 text-sm font-mono text-gray-700">
                                {ticket.codigo}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-800">
                                <Link
                                  to={`/helpdesk/task/${ticket.id}`}
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  {ticket.tema}
                                </Link>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusLabel(
                                    ticket.estado,
                                    ticket.isAuthorized
                                  )}`}
                                >
                                  {getStatusLabel(
                                    ticket.estado,
                                    ticket.isAuthorized
                                  )}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold">
                                {
                                  ticket.isAttended === true ? "Si" : "No"
                                }
                              </span>
                            </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {formatDate(ticket.fechaCreacion)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {ticket.fechaCierre !== null
                                  ? getCierre(new Date(ticket.fechaCierre))
                                  : getCierre(ticket.fechaCierre)}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span
                                  className={`font-medium ${getPriorityLabel(
                                    ticket.prioridad
                                  )}`}
                                >
                                  {getPriorityLabel(ticket.prioridad)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            {/* Paginación de tickets */}
            {ticketTotalPages > 1 && !loading && (
              <PaginationControl
                currentPage={ticketPage}
                totalPages={ticketTotalPages}
                onPageChange={setTicketPage}
              />
            )}
          </div>
        </div>
      </div>
    </Transition>
  );
};

// --- Componente de Tarjeta de Información del Usuario ---
const UserInfoCard = memo(({ usuario, isAdmin }) => (
  <div className="bg-white h-full rounded-2xl shadow-lg p-3 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
    <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-24 w-24 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md">
      {usuario.nombre.charAt(0)}
      {usuario.apellido.charAt(0)}
    </div>
    <div className="text-center md:text-left p-5">
      <h1 className="text-3xl font-bold text-gray-800 justify-between items-end flex">
        {usuario.nombre} {usuario.apellido}
        {isAdmin && (
          <Link to={`/admin/edit-user/${usuario.id}`} className="text-xl py-3">
            <FaPencil color="black" />
          </Link>
        )}
      </h1>
      <a
        href={`mailto:${usuario.email}`}
        className="text-md text-blue-600 hover:underline flex items-center justify-center w-fit md:justify-start"
      >
        <FaEnvelope className="mr-2" />
        {usuario.email}
      </a>
      <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
        <InfoPill
          icon={<FaBriefcase />}
          text={usuario.departamento?.nombre || "Sin departamento"}
          color="indigo"
        />
        <InfoPill
          icon={<FaMapMarkerAlt />}
          text={usuario.ubicacion || "Sin ubicación"}
          color="green"
        />
        <InfoPill
          icon={<FaShieldAlt />}
          text={formatUserRole(usuario.rol.nombre)}
          color="blue"
        />
      </div>
    </div>
  </div>
));
UserInfoCard.displayName = "UserInfoCard";


// --- Card de accesos IP ---
const IpAccessCard = ({
  accesses,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-4 min-h-80">
    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-2">
      <FaDesktop className="mr-2 text-blue-600" />
      Accesos recientes por IP
    </h2>
    {loading ? (
      <PageLoader text="Cargando accesos..." />
    ) : accesses.length === 0 ? (
      <div className="text-gray-500 text-center py-6">
        No hay registros de acceso.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                IP
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                Fecha y hora
              </th>
            </tr>
          </thead>
          <tbody>
            {accesses.map((acc) => (
              <tr key={acc.id} className="border-b">
                <td className="py-2 px-4 text-sm text-gray-800">{acc.ip}</td>
                <td className="py-2 px-4 text-sm text-gray-800 flex items-center">
                  <FaClock className="mr-2 text-gray-400" />
                  {formatDate(acc.fechaRegistro)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {/* Paginación */}
    {totalPages > 1 && (
      <div className="flex justify-end items-center mt-4 gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
          Anterior
        </button>
        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
          Siguiente
        </button>
      </div>
    )}
  </div>
);

UserInfoCard.propTypes = {
  usuario: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
    departamento: PropTypes.shape({
      nombre: PropTypes.string,
    }),
    ubicacion: PropTypes.string,
  }),
  isAdmin: PropTypes.bool,
};

// --- Componente de Píldora de Información ---
const InfoPill = ({ icon, text, color }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[color]}`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </span>
  );
};

const PageLoader = ({ text }) => (
  <div className="flex flex-col items-center justify-center text-center py-5">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
    <p className="text-gray-600 font-medium">{text}</p>
  </div>
);

InfoPill.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["indigo", "green", "blue"]).isRequired,
};

PageLoader.propTypes = {
  text: PropTypes.string.isRequired,
};
IpAccessCard.propTypes = {
  accesses: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
};
