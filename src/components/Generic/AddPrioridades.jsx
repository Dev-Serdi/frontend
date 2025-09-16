import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import { createPrioridad } from "../../services/PrioridadService"; // Assuming this service function exists

export const AddPrioridad = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createPrioridad({ nombre });
      navigate("/admin/helpdesk/prioridades");
    } catch (err) {
      console.error("Error creating prioridad:", err);
      const errorMessage = err.response?.data?.message || "Error al crear la prioridad. Por favor, inténtelo de nuevo.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            Nueva Prioridad
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Prioridad
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="Ej: Alta, Media, Baja"
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
                onClick={() => navigate("/admin/helpdesk/prioridades")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 m-1 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 m-1 rounded transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar Prioridad"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
};