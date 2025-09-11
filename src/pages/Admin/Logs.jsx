import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { FaSearch, FaCalendarAlt, FaUser, FaEnvelope } from "react-icons/fa";
import { listAllIps } from "../../services/IpService";
import { Link } from "react-router-dom";

export const Logs = () => {
  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Nuevo estado para la búsqueda real
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchIps();
  }, [currentPage, searchQuery]); // Cambiado a searchQuery

  const fetchIps = async () => {
    try {
      setLoading(true);
      const response = await listAllIps(
        currentPage - 1,
        itemsPerPage,
        searchQuery // Usar searchQuery en lugar de searchTerm
      );
      setIps(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalElements || 0);
    } catch (err) {
      setError("Error al cargar registros de acceso");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setCurrentPage(1);
  };

  // Función para formatear fechas de forma amigable y consistente en UTC-7
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const timeZone = "Etc/GMT+7";
    const date = new Date(dateString);
    const now = new Date();
    const toDateStringInTimeZone = (d) =>
      d.toLocaleDateString("en-CA", { timeZone });
    const datePart = toDateStringInTimeZone(date);
    const todayPart = toDateStringInTimeZone(now);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayPart = toDateStringInTimeZone(yesterday);
    const dateYear = date.toLocaleDateString("en-US", {
      timeZone,
      year: "numeric",
    });
    const todayYear = now.toLocaleDateString("en-US", {
      timeZone,
      year: "numeric",
    });
    if (datePart === todayPart) {
      return `Hoy a las ${date.toLocaleTimeString("es-ES", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    if (datePart === yesterdayPart) {
      return `Ayer a las ${date.toLocaleTimeString("es-ES", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return date.toLocaleDateString("es-ES", {
      timeZone,
      day: "numeric",
      month: "short",
      year: dateYear !== todayYear ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    items.push(
      <button
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        Anterior
      </button>
    );
    if (startPage > 1) {
      items.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 ${
            1 === currentPage
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        items.push(
          <span key="dots-start" className="px-2 py-1">
            ...
          </span>
        );
      }
    }
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1 ${
            number === currentPage
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {number}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="dots-end" className="px-2 py-1">
            ...
          </span>
        );
      }
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 ${
            totalPages === currentPage
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }
    items.push(
      <button
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        Siguiente
      </button>
    );
    return items;
  };

  if (error) {
    return (
      <div className="bg-white rounded shadow-md p-6 mt-4">
        <div className="text-red-500 font-medium">{error}</div>
        <button
          className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          onClick={fetchIps}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Registros de Acceso</h2>
      </div>
      <div className="bg-white rounded shadow-md overflow-hidden">
        <div className="p-6">
          {/* Recuadro de búsqueda mejorado */}
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 p-3 flex items-center pointer-events-none">
                  <FaSearch
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  name="searchIp"
                  id="searchIp"
                  className="p-5 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Buscar
              </button>
            </form>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Encabezados de la tabla */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded mb-3 font-medium text-gray-600 uppercase text-sm">
                <div className="col-span-2">Dirección IP</div>
                <div className="col-span-3">Nombre</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Fecha de acceso</div>
              </div>
              {/* Lista de registros */}
              {ips.length > 0 ? (
                ips.map((ip) => (
                  <div
                    key={ip.id}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-2 text-gray-700 font-mono">
                      {ip.ip}
                    </div>
                    <div className="col-span-3 text-gray-700 font-medium">
                      <Link to={`/perfil/${ip.usuarioId}`} className="text-decoration-none">
                        {ip.nombreUsuario}{" "}{}
                      
                      </Link>
                    </div>
                    <div className="col-span-3 text-gray-700">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {ip.usuarioEmail}
                      </div>
                    </div>
                    <div className="col-span-2 text-gray-700">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {formatDate(ip.fechaRegistro)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {searchTerm
                    ? `No se encontraron registros para "${searchTerm}"`
                    : "No hay registros de acceso disponibles"}
                </div>
              )}
              {/* Paginación mejorada */}
              {totalPages > 1 && (
                <div className="mt-3 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} - {" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} de{" "}
                    {totalItems} registros
                  </div>
                  <div className="inline-flex rounded shadow-sm" role="group">
                    {renderPagination()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Transition>
  );
};
