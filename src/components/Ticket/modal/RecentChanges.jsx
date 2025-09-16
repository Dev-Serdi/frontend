import React, { useState, useEffect, useCallback } from "react";
import { DialogTitle } from "@headlessui/react";
import ModalWrapper from "../../ModalWrapper";
import Button from "../../Button";
import { getTicketHistory } from "../../../services/TicketService";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaHistory,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

// Función de ayuda para formatear la fecha (sin cambios, ya era robusta).
const formatHistoryTimestamp = (timestamp) => {
  if (!timestamp) return "Fecha desconocida";
  try {
    const date = new Date(timestamp);

    // Restar 7 horas a la fecha
    date.setHours(date.getHours() - 7);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return "Fecha inválida";
  }
};

/**
 * ## Función `compareSnapshots` (Mejorada)
 * Compara dos snapshots (el estado actual y el previo) para identificar qué campos cambiaron.
 * @param {object} current - El snapshot de la revisión actual.
 * @param {object | null} previous - El snapshot de la revisión inmediatamente anterior.
 * @returns {string[]} Un array de strings describiendo cada cambio detectado.
 */
const compareSnapshots = (current, previous) => {
  // Si no hay snapshot previo, es la creación del ticket.
  if (!previous) {
    // Podemos enriquecer la creación mostrando los valores iniciales.
    const initialState = [
      `Tema inicial: "${current.tema}"`,
      `Prioridad inicial: "${current.prioridadNombre}"`,
    ];
    return ["Ticket Creado", ...initialState];
  }

  const changes = [];
  // Mapeo de claves a nombres legibles. Asegúrate que estas claves coinciden con las de tu DTO.
  const fieldsToCompare = {
    tema: "Tema",
    descripcion: "Descripción",
    departamentoNombre: "Departamento",
    incidenciaNombre: "Incidencia",
    prioridadNombre: "Prioridad",
    estadoNombre: "Estado",
    usuarioAsignadoNombres: "Usuario Asignado",
    fechaCompromiso: "Fecha de Compromiso",
    isTrashed: "Estado de Papelera",
    usuarioCerrar: "Usuario de Cierre",
  };

  for (const key in fieldsToCompare) {
    // Se usa "Sin asignar" o "No definido" para valores nulos/indefinidos, más legible.
    const currentValue =
      current[key] ??
      (key === "usuarioAsignadoNombres" ? "Sin asignar" : "No definido");
    const previousValue =
      previous[key] ??
      (key === "usuarioAsignadoNombres" ? "Sin asignar" : "No definido");
    if (currentValue !== previousValue) {
      // Formato especial para la papelera, que es un evento claro.
      if (key === "isTrashed") {
        changes.push(
          `Ticket ${
            currentValue ? "movido a la papelera" : "restaurado de la papelera"
          }`
        );
      }
      // Formato para la fecha, que necesita un manejo especial.
      else if (key === "fechaCompromiso") {
        if(formatHistoryTimestamp(previousValue) === "Invalid Date") {
          changes.push(`${fieldsToCompare[key]} se estableció a "${currentValue}"`);          
        }
        else{
          changes.push(
            `${fieldsToCompare[key]} cambió de "${formatHistoryTimestamp(
              previousValue
            )}" a "${currentValue}"`
          );
        }
      }
      // Formato estándar para el resto de los campos.
      else {
        changes.push(
          `${fieldsToCompare[key]} cambió de "${previousValue}" a "${currentValue}"`
        );
      }
    }
  }

  // Si no hay cambios detectados, no es necesario mostrar nada.
  // La lógica del historial asume que cada revisión tiene al menos un cambio.
  return changes;
};

export const RecentChanges = ({ open, setOpen, ticketId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getTicketHistory(ticketId);

      // **CORRECCIÓN CLAVE 1: Ordenar el historial cronológicamente.**
      // Se ordena por número de revisión de forma ascendente (del más antiguo al más nuevo).
      const sortedHistory = response.data.sort(
        (a, b) => a.revisionNumber - b.revisionNumber
      );

      setHistory(sortedHistory);
    } catch (err) {
      console.error("Error al obtener el historial del ticket:", err);
      const errorMessage =
        err.response?.data?.error || "No se pudo cargar el historial.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, fetchHistory]);

  const closeDialog = () => setOpen(false);

  return (
    <ModalWrapper open={open} setOpen={closeDialog}>
      <div className="p-4 sm:p-6">
        <DialogTitle
          as="h3"
          className="text-lg font-semibold leading-6 text-gray-900 mb-4 flex items-center gap-2"
        >
          <FaHistory className="text-indigo-600" />
          Historial de Cambios del Ticket
        </DialogTitle>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin h-6 w-6 mx-auto text-indigo-500" />
              <p className="mt-2 text-gray-500">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg">
              <FaExclamationTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          ) : history.length > 0 ? (
            <ul className="space-y-6 border-l-2 border-gray-200 ml-2">
              {history.map((revision, index) => {
                // **CORRECCIÓN CLAVE 2: Comparar con el snapshot ANTERIOR.**
                // Si index es 0, no hay anterior (es la creación).
                const previousSnapshot =
                  index > 0 ? history[index - 1].entitySnapshot : null;
                const changes = compareSnapshots(
                  revision.entitySnapshot,
                  previousSnapshot
                );

                // No renderizar una revisión si la función de comparación no devuelve cambios.
                if (changes.length === 0) return null;

                return (
                  <li key={revision.revisionNumber} className="relative pl-8">
                    {/* El punto en la línea de tiempo */}
                    <span className="absolute -left-[17px] top-1 h-4 w-4 bg-indigo-500 rounded-full border-4 border-white"></span>

                    <div className="flex items-center justify-between flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">
                        Revisión #{revision.revisionNumber}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaUser /> {revision.authorEmail || "Sistema"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />{" "}
                          {formatHistoryTimestamp(revision.revisionTimestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
                      {/* El primer cambio (ej: "Ticket Creado") puede actuar como título */}
                      <p className="font-medium mb-1">{changes[0]}</p>
                      {changes.length > 1 && (
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          {/* Mapear el resto de los cambios */}
                          {changes.slice(1).map((change, i) => (
                            <li key={i}>{change}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No hay historial de cambios para mostrar.</p>
            </div>
          )}
        </div>

        <div className=" mt-3 sm:flex sm:flex-row-reverse">
          <Button
            type="button"
            className="bg-white rounded text-sm font-semibold text-gray-900 sm:w-auto border hover:bg-gray-50"
            onClick={closeDialog}
            label="Cerrar"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
