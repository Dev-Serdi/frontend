import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import {
  createDepartamento,
  getDepartamentoById,
  updateDepartamento,
} from "../../services/DepartamentoService";

export const AddDepartamento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!!id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      setPageLoading(true);
      getDepartamentoById(id)
        .then((response) => {
          setNombre(response.data.nombre);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching departamento:", err);
          const errorMessage =
            err.response?.data?.message ||
            "Error al cargar los datos del departamento.";
          setError(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => {
          setPageLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre del departamento es obligatorio.");
      return;
    }
    setLoading(true);
    setError(null);

    const departamentoData = { nombre };

    try {
      if (id) {
        await updateDepartamento(id, departamentoData);
        toast.success("Departamento actualizado correctamente.");
      } else {
        await createDepartamento(departamentoData);
        toast.success("Departamento creado correctamente.");
      }
      navigate("/admin/helpdesk/departamentos");
    } catch (err) {
      console.error("Error guardando departamento:", err);
      const errorMessage =
        err.response?.data?.message ||
        `Error al ${
          id ? "actualizar" : "crear"
        } el departamento. Por favor, inténtelo de nuevo.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = id ? "Editar Departamento" : "Nuevo Departamento";
  const saveButtonText = id ? "Actualizar" : "Guardar Departamento";
  const savingButtonText = id ? "Actualizando..." : "Guardando...";

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
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
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-4 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {pageTitle}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Departamento
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="Ej: Recursos Humanos"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/helpdesk/departamentos")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 m-1 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 m-1 rounded transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar Departamento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
};
