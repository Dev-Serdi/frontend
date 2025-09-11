import React, { useState, useEffect, useCallback } from "react";
import { DialogTitle } from "@headlessui/react";
import ModalWrapper from "../../ModalWrapper";
import Button from "../../Button";
import clsx from "clsx";
import { toast } from "sonner";
import { listAllDepartamentos } from "../../../services/DepartamentoService";
import { listUsers } from "../../../services/UsuarioService";
import { listAllIncidencias } from "../../../services/IncidenciaService";
import { reassignDepartment } from "../../../services/TicketService";

export const ReassingDepartment = ({ open, setOpen, ticketId, onReassigned }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [allIncidencias, setAllIncidencias] = useState([]); // Todas las incidencias
  const [filteredIncidencias, setFilteredIncidencias] = useState([]); // Incidencias filtradas
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [selectedIncidencia, setSelectedIncidencia] = useState("");
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartamentos = useCallback(async () => {
    setLoadingDepartamentos(true);
    try {
      const response = await listAllDepartamentos();
      setDepartamentos(response.data || []);
    } catch (error) {
      console.error("Error fetching departamentos:", error);
    } finally {
      setLoadingDepartamentos(false);
    }
  }, []);

  const fetchUsuarios = useCallback(async (departamentoId) => {
    if (!departamentoId) {
      setUsuarios([]);
      return;
    }
    setLoadingUsuarios(true);
    try {
      const response = await listUsers(departamentoId);
      setUsuarios(response.data.content || []);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  // Fetch todas las incidencias una sola vez
  const fetchIncidencias = useCallback(async () => {
    setLoadingIncidencias(true);
    try {
      const response = await listAllIncidencias();
      setAllIncidencias(response.data || []);
    } catch (error) {
      console.error("Error fetching incidencias:", error);
    } finally {
      setLoadingIncidencias(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchDepartamentos();
      fetchIncidencias();
    } else {
      setDepartamentos([]);
      setUsuarios([]);
      setAllIncidencias([]);
      setFilteredIncidencias([]);
      setSelectedDepartamento("");
      setSelectedUsuario("");
      setSelectedIncidencia("");
    }
  }, [open, fetchDepartamentos, fetchIncidencias]);

  // Filtra incidencias por departamento seleccionado
  useEffect(() => {
    if (selectedDepartamento) {
      const deptId = parseInt(selectedDepartamento, 10);
      const filtered = allIncidencias.filter(
        (inc) => inc.departamento?.id === deptId
      );
      setFilteredIncidencias(filtered);
      setSelectedIncidencia(""); // Resetea la incidencia seleccionada
      fetchUsuarios(deptId); // Carga usuarios del departamento
      setSelectedUsuario(""); // Resetea usuario seleccionado
    } else {
      setFilteredIncidencias([]);
      setUsuarios([]);
      setSelectedIncidencia("");
      setSelectedUsuario("");
    }
  }, [selectedDepartamento, allIncidencias, fetchUsuarios]);

  const handleDepartamentoChange = (e) => {
    setSelectedDepartamento(e.target.value);
  };

  const handleUsuarioChange = (e) => {
    setSelectedUsuario(e.target.value);
  };

  const handleIncidenciaChange = (e) => {
    setSelectedIncidencia(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDepartamento) {
      toast.warning("Por favor, seleccione un departamento.");
      return;
    }
    if (!selectedUsuario) {
      toast.warning("Por favor, seleccione un usuario.");
      return;
    }
    if (!selectedIncidencia) {
      toast.warning("Por favor, seleccione una incidencia.");
      return;
    }

    setIsSubmitting(true);
    try {
      await reassignDepartment(ticketId, selectedUsuario, selectedIncidencia, selectedDepartamento);
      onReassigned();
    } catch (error) {
      console.error("Error al reasignar el ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <ModalWrapper open={open} setOpen={closeDialog}>
      <form onSubmit={handleSubmit} className="p-4">
        <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6 text-center">
          Reasignar Ticket
        </DialogTitle>

        <div className="space-y-4">
          {/* Departamento Select */}
          <div>
            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              id="departamento"
              value={selectedDepartamento}
              onChange={handleDepartamentoChange}
              disabled={loadingDepartamentos || isSubmitting}
              className={clsx(
                "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                (loadingDepartamentos || isSubmitting) && "bg-gray-100 cursor-not-allowed"
              )}
            >
              <option value="" disabled>
                {loadingDepartamentos ? "Cargando..." : "Seleccione un departamento"}
              </option>
              {departamentos.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario Select */}
          <div>
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <select
              id="usuario"
              value={selectedUsuario}
              onChange={handleUsuarioChange}
              disabled={!selectedDepartamento || loadingUsuarios || isSubmitting}
              className={clsx(
                "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                (!selectedDepartamento || loadingUsuarios || isSubmitting) && "bg-gray-100 cursor-not-allowed"
              )}
            >
              <option value="" disabled>
                {!selectedDepartamento
                  ? "Seleccione un departamento primero"
                  : loadingUsuarios
                  ? "Cargando usuarios..."
                  : usuarios.length > 0
                  ? "Seleccione un usuario"
                  : "No hay usuarios en este departamento"}
              </option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {[user.nombre, user.apellido].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </div>

          {/* Incidencia Select */}
          <div>
            <label htmlFor="incidencia" className="block text-sm font-medium text-gray-700 mb-1">
              Incidencia
            </label>
            <select
              id="incidencia"
              value={selectedIncidencia}
              onChange={handleIncidenciaChange}
              disabled={!selectedDepartamento || loadingIncidencias || isSubmitting}
              className={clsx(
                "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                (!selectedDepartamento || loadingIncidencias || isSubmitting) && "bg-gray-100 cursor-not-allowed"
              )}
            >
              <option value="" disabled>
                {!selectedDepartamento
                  ? "Seleccione un departamento primero"
                  : loadingIncidencias
                  ? "Cargando incidencias..."
                  : filteredIncidencias.length > 0
                  ? "Seleccione una incidencia"
                  : "No hay incidencias para este departamento"}
              </option>
              {filteredIncidencias.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 sm:flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedUsuario}
            className={clsx(
              "px-4 text-sm font-semibold text-white sm:w-auto rounded",
              "bg-indigo-600 hover:bg-indigo-700",
              (isSubmitting || !selectedUsuario) && "opacity-50 cursor-not-allowed"
            )}
            label={isSubmitting ? "Reasignando..." : "Reasignar"}
          />
          <Button
            type="button"
            className="bg-white px-4 rounded text-sm font-semibold text-gray-900 sm:w-auto border hover:bg-gray-50"
            onClick={closeDialog}
            disabled={isSubmitting}
            label="Cancelar"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};