import { Transition } from "@headlessui/react";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { getDepartamentoById } from "../../services/DepartamentoService";
import { listUsers } from "../../services/UsuarioService";
import { Link } from "react-router-dom";
import { PaginationControl } from "./PaginationControl";

export const UsuariosTableGeneric = (deptId) => {
  const id = deptId.id;  
  const [departamento, setDepartamento] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const depRes = await getDepartamentoById(id);
      setDepartamento(depRes.data);
      const usersRes = await listUsers(id, userPage - 1, itemsPerPage, "");

      setUsuarios(usersRes.data.content || []);
      setUserTotalPages(usersRes.data.totalPages || 0);
    } catch (err) {
      console.error("Error al cargar los datos:", err);
      setError(
        "No se pudieron cargar los datos del departamento. ",
        error.message
      );
    } finally {
      setLoading(false);
    }
  }, [id, userPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resetea la página de tickets cuando el filtro cambia

  return (
    <Transition
      as={Fragment}
      appear={true}
      show={true}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-2 border-b border-gray-200 flex flex-col sm:flex-row justify-around items-center">
          <h2 className="text-center text-2xl font-bold text-gray-800 flex items-center justify-center">
            <FaUsers className="mr-3 text-blue-500" />
            <span>
              Usuarios en {departamento ? departamento.nombre : "..."}
            </span>
          </h2>
          <span className="text-white p-2">Cargando Informacion.</span>
        </div>
        <div className="p-2">
          {/* Contenido de la tabla de usuarios */}
          <div className="flex flex-col min-h-[350px]">
            <div className="flex-grow overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2}>
                        <PageLoader />
                      </td>
                    </tr>
                  ) : usuarios.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-5 text-gray-500"
                      >
                        No hay usuarios en este departamento.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <Link
                            to={`/perfil/${user.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {user.nombre} {user.apellido}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {userTotalPages > 1 && !loading && (
              <PaginationControl
                currentPage={userPage}
                totalPages={userTotalPages}
                onPageChange={setUserPage}
              />
            )}
          </div>
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
