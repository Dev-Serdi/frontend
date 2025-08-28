import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import { createIncidencia } from "../../services/IncidenciaService";
import { listAllDepartamentos } from "../../services/DepartamentoService";

// Modal simple para confirmar incidencia general
const ConfirmGeneralModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-5 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4 text-center">Incidencia general</h3>
        <p className="mb-4 text-gray-00 text-center">
          ¿Desea agregar la incidencia como <span className="font-bold">Incidencia general sin departamento</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Sí, agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddIncidencia = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showGeneralModal, setShowGeneralModal] = useState(false);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await listAllDepartamentos();
        setDepartamentos(response.data);
      } catch (err) {
        console.error("Error fetching departamentos:", err);
      }
    };
    fetchDepartamentos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre de la incidencia es obligatorio.");
      return;
    }
    if (!departamentoId) {
      // Mostrar modal de confirmación
      setShowGeneralModal(true);
      return;
    }
    await submitIncidencia({ nombre, departamento: { id: departamentoId } });
  };

  // Función para crear la incidencia (general o con departamento)
  const submitIncidencia = async (incidenciaData) => {
    setLoading(true);
    setFormError(null);
    try {
      await createIncidencia(incidenciaData);
      navigate("/admin/helpdesk/incidencias");
    } catch (err) {
      console.error("Error creating incidencia:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Error al crear la incidencia. Por favor, inténtelo de nuevo.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar agregar como incidencia general
  const handleConfirmGeneral = async () => {
    setShowGeneralModal(false);
    await submitIncidencia({ nombre });
  };

  // Cancelar agregar como incidencia general
  const handleCancelGeneral = () => {
    setShowGeneralModal(false);
  };

  return (
    <>
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
              Nueva Incidencia
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Incidencia
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  placeholder="Ej: Problema con impresora"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <select
                  id="departamento"
                  value={departamentoId}
                  onChange={(e) => setDepartamentoId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Sin departamento (general)</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded">{formError}</p>
              )}

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/admin/helpdesk/incidencias")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar Incidencia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
      <ConfirmGeneralModal
        open={showGeneralModal}
        onConfirm={handleConfirmGeneral}
        onCancel={handleCancelGeneral}
      />
    </>
  );
};