import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { DialogTitle } from "@headlessui/react";
import ModalWrapper from "../../ModalWrapper";
import Button from "../../Button";
import { updateCommitmentDate } from "../../../services/TicketService";

/**
 * @component CommitmentDate
 * @description Modal for setting or updating a ticket's commitment date.
 * @param {{open: boolean, setOpen: (open: boolean) => void, ticketId: number, onCommitmentDateAdded: () => void}} props
 */
export const CommitmentDate = ({
  open,
  setOpen,
  ticketId,
  onCommitmentDateAdded,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDialog = () => {
    reset();
    setOpen(false);
  };

  const handleOnSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // NOTE: This service function is ready for your backend implementation.
      await updateCommitmentDate(ticketId, data.commitmentDate);
      if (onCommitmentDateAdded) {
        onCommitmentDateAdded();
      }
    } catch (err) {
      console.error("Error al actualizar la fecha de compromiso:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper open={open} setOpen={closeDialog}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="p-4">
        <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-3 text-center">
          Agregar Fecha de Compromiso
        </DialogTitle>

        <div className="mt-2">
          <label htmlFor="commitmentDate" className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Fecha de Compromiso
          </label>
          <input
            type="date"
            id="commitmentDate"
            className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...register("commitmentDate", {
              required: "La fecha de compromiso es obligatoria.",
            })}
            min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
          />
          {errors.commitmentDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.commitmentDate.message}
            </p>
          )}
        </div>

        <div className="mt-4 sm:flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 text-sm rounded font-semibold text-white sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            label={isSubmitting ? "Actualizando..." : "Actualizar Fecha"}
          />
          <Button
            type="button"
            className="bg-white rounded px-8 text-sm font-semibold text-gray-900 sm:w-auto border hover:bg-gray-50"
            onClick={closeDialog}
            disabled={isSubmitting}
            label="Cancelar"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};
