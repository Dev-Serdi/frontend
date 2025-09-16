import React from "react";
import ModalWrapper from "../../ModalWrapper";
import Button from "../../Button";
import { DialogTitle } from "@headlessui/react";
import clsx from "clsx";

export const MarkNotAuthorizedModal = ({
  open,
  setOpen,
  onConfirm,
  isSubmitting = false,
}) => {
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onConfirm) await onConfirm();
    setOpen(false);
  };

  return (
    <ModalWrapper open={open} setOpen={handleClose}>
      <form onSubmit={handleSubmit} className="p-2">
        <DialogTitle
          as="h3"
          className="text-lg font-semibold leading-6 text-gray-900 mb-3 text-center"
        >
          Marcar Ticket como No Autorizado
        </DialogTitle>
        <div className="mb-4 text-center">
          ¿Estás seguro que deseas marcar este ticket como<br/>
          <span className="font-bold text-red-600">No Autorizado</span>?<br />
          Esta acción no se puede deshacer.
        </div>
        <div className="mt-4 sm:flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "px-4 text-sm font-semibold text-white sm:w-auto rounded",
              "bg-red-600 hover:bg-red-700",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
            label={isSubmitting ? "Enviando..." : "Confirmar"}
          />
          <Button
            type="button"
            className="bg-white px-4 rounded text-sm font-semibold text-gray-900 sm:w-auto border hover:bg-gray-50"
            onClick={handleClose}
            disabled={isSubmitting}
            label="Cancelar"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};
