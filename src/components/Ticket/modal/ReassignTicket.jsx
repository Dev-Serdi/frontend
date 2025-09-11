import React, { useState, useEffect, useCallback } from "react";
import { DialogTitle } from "@headlessui/react";
import ModalWrapper from "../../ModalWrapper";
import Button from "../../Button";
import clsx from "clsx";
import { toast } from "sonner";
import { listUsers } from "../../../services/UsuarioService";
import { reassignUser } from "../../../services/TicketService"; // NOTE: This service function needs to be created

export const ReassingTicket = ({
  open,
  setOpen,
  deptoId,
  ticketId,
  onReassigned,
}) => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsuarios = useCallback(async (departamentoId) => {
    setUsuarios([]);
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

  useEffect(() => {
    if (open) {
      fetchUsuarios(deptoId);
    }
    setUsuarios([]);
    setSelectedUsuario("");
  }, [open]);

  const handleUsuarioChange = (e) => {
    setSelectedUsuario(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUsuario) {
      toast.warning("Por favor, seleccione un usuario.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming the `reassignTicket` service expects (ticketId, userId)
      await reassignUser(ticketId, selectedUsuario);
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
      <form onSubmit={handleSubmit} className="p-2">
        <DialogTitle
          as="h3"
          className="text-lg font-semibold leading-6 text-gray-900 mb-3 text-center"
        >
          Reasignar Ticket
        </DialogTitle>

        <div className="mb-3">
          {/* Usuario Select */}
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-gray-70 mb-2"
            >
              Usuario
            </label>
            <select
              id="usuario"
              value={selectedUsuario}
              onChange={handleUsuarioChange}
              className={clsx(
                "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                (loadingUsuarios || isSubmitting) &&
                  "bg-gray-100 cursor-not-allowed"
              )}
            >
              <option value="" disabled>
                {loadingUsuarios
                  ? "Cargando usuarios..."
                  : usuarios.length > 0
                  ? "Seleccione un usuario"
                  : "No hay usuarios disponibles"}
              </option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {[user.nombre, user.apellido].filter(Boolean).join(" ")}
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
              (isSubmitting || !selectedUsuario) &&
                "opacity-50 cursor-not-allowed"
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
