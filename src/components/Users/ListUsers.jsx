import React, { useState, useEffect, useCallback } from "react";
import { Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { deleteUser, listUsers } from "../../services/UsuarioService";
import { formatUserRole } from "../../utils/utils";

export const ListedUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // La paginación de la UI es 1-indexada, pero para la API será 0-indexada (currentPage - 1)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Nuevo estado para el input

  const itemsPerPage = 8;

  const navigate = useNavigate();

  // useCallback para memoizar la función y evitar re-creaciones innecesarias.
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes] = await Promise.all([
        listUsers(
          null,
          currentPage-1,
          itemsPerPage,
          searchTerm
        ),
      ]);
      // La página se envía como 0-indexada a la API
      setUsuarios(usersRes.data.content || []);
      setTotalPages(usersRes.data.totalPages || 0);
    } catch (err) {
      setError(
        "Error al cargar usuarios. Por favor, intente de nuevo más tarde."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]); // Depende de la página actual y el término de búsqueda

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Resetear a la primera página con nueva búsqueda
    }
  };

  const renderPagination = () => {
    let items = [];

    // Botón "Anterior"
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

    // Números de página
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1 ${
            currentPage === number
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {number}
        </button>
      );
    }

    // Botón "Siguiente"
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

  if (error && !loading) {
    return (
      <div className="bg-white rounded shadow-md p-6 mt-4 text-center">
        <div className="text-red-500 font-medium mb-4">{error}</div>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          onClick={fetchUsuarios}
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
      show={true}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Usuarios</h2>
      </div>
      <div className="bg-white rounded shadow-md overflow-hidden mb-1">
        <div className="p-1">
          <div className="m-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 p-3 flex items-center pointer-events-none">
                <FaSearch
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="searchUser"
                id="searchUser"
                className="p-5 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                placeholder="Buscar por nombre, apellido o email..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-2">
              <div className="animate-spin rounded h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded mb-3 font-medium text-gray-600 uppercase text-sm">
                <div className="col-span-3 text-center">Nombre</div>
                <div className="col-span-2 text-center">Depto.</div>
                <div className="col-span-2 text-center">Rol</div>
                <div className="col-span-2 text-center">Ubicacion</div>
                <div className="col-span-2 text-center">Email</div>
                <div className="col-span-1 text-center">Acciones</div>
              </div>

              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-3 text-center text-gray-700">
                      <Link className="text-decoration-none" to={`/perfil/${usuario.id}`}>
                      {usuario.nombre} {usuario.apellido}
                      
                      </Link>
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {
                        usuario.departamento?.nombre ? null : "Sin departamento"
                      }
                      {usuario.departamento?.nombre}
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {formatUserRole(usuario.rol?.nombre)}
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {usuario?.ubicacion ? null : "No especificado"}
                      {usuario.ubicacion}
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {usuario.email}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 m-1 bg-blue-50 hover:bg-blue-100 rounded p-2 transition-colors"
                        onClick={() =>
                          navigate(`/admin/edit-user/${usuario.id}`)
                        }
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
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
                  No se encontraron usuarios
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
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
