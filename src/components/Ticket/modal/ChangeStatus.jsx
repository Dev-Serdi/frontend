import React from "react";
import { updateTicketStatus } from "../../../services/TicketService";
import ModalWrapper from "../../ModalWrapper";
import { DialogTitle } from "@headlessui/react";
import Button from "../../Button";
import { useState } from "react";
import clsx from "clsx";
import { getUserId } from "../../../services/UsuarioService";

export const ChangeStatus = ({
  open,
  setOpen,
  ticketId,
  targetEstado, // Nuevo parámetro
  onChangeStatus,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await getUserId();
      const userId = response.data;
      await updateTicketStatus(ticketId, targetEstado, userId);
      onChangeStatus();
      setOpen(false);
    } catch (error) {
      console.error(error);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => setOpen(false);

  // Mensaje dinámico según el estado destino
  const getMessage = () => {
    if (targetEstado === 2) return "¿Desea marcar el ticket como 'completado'?";
    if (targetEstado === 3) return "¿Desea marcar el ticket como 'cerrado'?";
    if (targetEstado === 1)
      return "¿Desea reabrir el ticket y marcarlo como 'en proceso'?";
    return "";
  };

  return (
    <ModalWrapper open={open} setOpen={closeDialog}>
      <form onSubmit={handleSubmit} className="p-2">
        <DialogTitle
          as="h3"
          className="text-lg font-semibold leading-6 text-gray-900 mb-3 text-center"
        >
          Cambiar Estado del Ticket
        </DialogTitle>
        <div className="mb-4">{getMessage()}</div>
        <div className="mt-4 sm:flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "px-4 text-sm font-semibold text-white sm:w-auto rounded",
              "bg-indigo-600 hover:bg-indigo-700",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
            label={isSubmitting ? "Enviando..." : "Aceptar"}
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
