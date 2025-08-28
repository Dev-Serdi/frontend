import React, { useState, useEffect, useCallback } from "react";
import { Transition } from "@headlessui/react";
import * as XLSX from "xlsx";
import { listTicketsByCriteria, listUbicaciones } from "../../services/TicketService";
import { formatFecha, getDiasCompromiso, getFechaRespuesta } from "../../utils/utils";
import { listAllDepartamentos } from "../../services/DepartamentoService";
import { listUsers } from "../../services/UsuarioService";
import { FaFilter } from "react-icons/fa";

export const ReporteTasks = () => {
  const [tickets, setTickets] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ubicacion, setUbicacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros
  const [filters, setFilters] = useState({
    departamentoId: '',
    creadorId: '',
    asignadoId: '',
    estadoId: '',
    prioridadId: '',
    isAuthorized: '',
    hasResponse: '',
    ubicacion: '',
  });

  const loadFilterOptions = useCallback(async () => {
    try {
      const [deptoRes, userRes, ubiRes] = await Promise.all([
        listAllDepartamentos(),
        listUsers(null, 0 , 1000, ""),
        listUbicaciones()        
      ]);
      setDepartamentos(deptoRes.data || []);
      setUbicacion(ubiRes.data || []);
      setUsuarios(userRes.data.content || []);
    } catch (error) {
      console.error("Error cargando opciones de filtro:", error);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const response = await listTicketsByCriteria(filters);
      setTickets(response.data.content || []);
    } catch (error) {
      console.error("Error al filtrar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = tickets.map((ticket) => ({
      "Código": ticket.codigo,
      "Tema": ticket.tema,
      "Dpto. Asignado": ticket.departamentoNombre,
      "Creado por": ticket.usuarioCreadorNombres,
      "Asignado a": ticket.usuarioAsignadoNombres,
      "Fecha de Creación": formatFecha(ticket.fechaCreacion),
      "Fecha de Compromiso": formatFecha(ticket.fechaCompromiso),
      "Primera respuesta": formatFecha(ticket.fechaRespuesta),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Tareas");
    XLSX.writeFile(workbook, "reporte_tareas.xlsx");
  };

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className="mx-auto pt-3 pb-3 sm: lg:p-8"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Generador de Reportes</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Mostrar/Ocultar Filtros"
          >
            <FaFilter className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* --- FORMULARIO DE FILTROS DESPLEGABLE --- */}
        <Transition
          show={showFilters}
          enter="transition-all ease-in-out duration-100"
          enterFrom="opacity-0 max-h-0"
          enterTo="opacity-100 max-h-screen"
          leave="transition-all ease-in-out duration-100"
          leaveFrom="opacity-100 max-h-screen"
          leaveTo="opacity-0 max-h-0"
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 bg-gray-50 border-b overflow-hidden">
            <div>
              <label htmlFor="departamentoId" className="block text-sm font-medium text-gray-700">Departamento</label>
              <select name="departamentoId" value={filters.departamentoId} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="asignadoId" className="block text-sm font-medium text-gray-700">Asignado a</label>
              <select name="asignadoId" value={filters.asignadoId} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="creadorId" className="block text-sm font-medium text-gray-700">Creado por</label>
              <select name="creadorId" value={filters.creadorId} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="estadoId" className="block text-sm font-medium text-gray-700">Estado</label>
              <select name="estadoId" value={filters.estadoId} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                <option value="1">En proceso</option>
                <option value="2">Completados</option>
                <option value="3">Cerrados</option>
              </select>
            </div>
            <div>
              <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">Ubicacion</label>
              <select name="ubicacion" value={filters.ubicacionId} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                {ubicacion.map(ub => <option key={ub.id} value={ub.nombre}>{ub.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prioridadId" className="block text-sm font-medium text-gray-700">Prioridad</label>
              <select name="prioridadId" value={filters.prioridadId} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                <option value="1">Alta</option>
                <option value="2">Media</option>
                <option value="3">Baja</option>
              </select>
            </div>
            <div>
              <label htmlFor="isAuthorized" className="block text-sm font-medium text-gray-700">Autorizado</label>
              <select name="isAuthorized" value={filters.isAuthorized} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label htmlFor="hasResponse" className="block text-sm font-medium text-gray-700">Respuesta</label>
              <select name="hasResponse" value={filters.hasResponse} onChange={handleFilterChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="col-span-full flex justify-end items-end">
              <button onClick={handleApplyFilters} disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Buscando...' : 'Aplicar Filtros'}
              </button>
            </div>
          </div>
        </Transition>

        {/* --- TABLA DE RESULTADOS Y EXPORTACIÓN --- */}
        <div className="p-4 flex justify-end">
          <button onClick={exportToExcel} disabled={tickets.length === 0} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
            Exportar a Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center p-12">Cargando resultados...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500 text-lg">No se encontraron datos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codigo</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tema</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dpto. Asignado</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado por</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de compromiso</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias de compromiso</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primera respuesta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket, index) => (
                  <tr key={ticket.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <a href={`/helpdesk/task/${ticket.id}`} className="text-blue-600 hover:text-blue-800 text-decoration-none">
                              {ticket.codigo}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {ticket.tema}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="p-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-900">
                        {ticket.departamentoNombre}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-semibold">
                        {ticket.usuarioCreadorNombres}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {ticket.usuarioAsignadoNombres}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(ticket.fechaCreacion)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(ticket.fechaCompromiso)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {getDiasCompromiso(ticket.fechaCompromiso)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {getFechaRespuesta(ticket.fechaCreacion, ticket.fechaRespuesta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Transition>
  );
};
