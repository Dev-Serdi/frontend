import React, { Fragment, useCallback, useEffect, useState } from "react";
import { PaginationControl } from "./PaginationControl";
import {
  formatDate,
  getPriorityLabel,
  getStatusLabel,
} from "../../utils/utils";
import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { FaTicketAlt } from "react-icons/fa";
import { getDepartamentoById } from "../../services/DepartamentoService";
import { listFilteredTickets } from "../../services/TicketService";

export const TicketTableGeneric = (deptId) => {
  const id = deptId.id;
  const [departamento, setDepartamento] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ticketPage, setTicketPage] = useState(1);
  const [ticketTotalPages, setTicketTotalPages] = useState(0);
  const itemsPerPage = 5; // Un valor más bajo para las tablas

  // Nuevo estado para el filtro de tickets
  const [statusFilter, setStatusFilter] = useState("");

  // Carga de datos unificada y optimizada
  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const depRes = await getDepartamentoById(id);
      const departamentoNombre = depRes.data.nombre;
      setDepartamento(depRes.data);

      const ticketsRes = await listFilteredTickets(
        ticketPage - 1,
        statusFilter,
        departamentoNombre,
        itemsPerPage
      );

      setTickets(ticketsRes.data.content || []);
      setTicketTotalPages(ticketsRes.data.totalPages || 0);
    } catch (err) {
      console.error("Error al cargar los datos:", err);
      setError(
        "No se pudieron cargar los datos del departamento. ",
        error.message
      );
    } finally {
      setLoading(false);
    }
  }, [id, ticketPage, statusFilter, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resetea la página de tickets cuando el filtro cambia
  useEffect(() => {
    setTicketPage(1);
  }, [statusFilter]);
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
      <div className="flex-1 overflow-auto min-h-150">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-5 ">
          <div className="p-2 border-b border-gray-200 flex flex-col sm:flex-row justify-around items-center">
            <h2 className="text-center text-2xl font-bold text-gray-800 flex items-end justify-end">
              <FaTicketAlt className="mr-3 text-green-500" />
              <span>Tickets del Departamento {departamento?.nombre}</span>
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
                <option value="">Más recientes</option>
                <option value="en-proceso">En Proceso</option>
                <option value="completados">Completados</option>
                <option value="cerrados">Cerrados</option>
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
                          Asignado a
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
                            No se encontraron tickets para este departamento.
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
                            <td className="py-3 px-4 text-sm font-mono text-gray-700">
                              <Link
                                to={`/perfil/${ticket.usuarioAsignado}`}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {ticket.usuarioAsignadoNombres}
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
    </Transition>
  );
};

const PageLoader = ({ text }) => (
  <div className="flex flex-col items-center justify-center text-center py-12">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
    <p className="text-gray-600 font-medium">{text}</p>
  </div>
);
