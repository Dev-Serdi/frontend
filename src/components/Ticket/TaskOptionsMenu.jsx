import React, { useState, useRef, useEffect } from "react";
import { BsClockHistory } from "react-icons/bs";
import { CiLock, CiUnlock } from "react-icons/ci";
import {
  FaEllipsisV,
  FaCalendarAlt,
  FaUserEdit,
  FaPencilAlt,
} from "react-icons/fa";

/**
 * @component TaskOptionsMenu
 * @description Renders a three-dot menu with options for a task.
 * @param {object} props
 * @param {() => void} props.onAddCommitmentDate - Function to call when "agregar fecha de compromiso" is clicked.
 * @param {() => void} props.onReassignTicket - Function to call when "reasignar ticket" is clicked.
 * @param {() => void} props.onReassignDepartment - Function to call when "reasignar ticket" is clicked.
 * @param {() => void} props.onEditTicket - Function to call when "editar ticket" is clicked.
 * @param {() => void} props.onRecentChanges - Function to call when "cambios recientes" is clicked.
 * @param {() => void} props.onCloseTicket - Function to call when "cerrar ticket" is clicked.
 * @param {() => void} props.onReopenTicket - Function to call when "reabrir ticket" is clicked.
 * @param {string[]} [props.permissions=[]] - Array of user permissions.
 * @param {number} props.ticketEstado - The current state of the ticket.
 */
const TaskOptionsMenu = ({
  onAddCommitmentDate,
  onReassignTicket,
  onReassignDepartment,
  onEditTicket,
  onRecentChanges,
  onChangeStatus,
  onMarkNotAuthorized,
  permissions = [],
  ticketEstado,
  rol = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const options = [
    {
      label: "Agregar fecha de compromiso",
      icon: <FaCalendarAlt className="m-1 text-gray-500" />,
      action: onAddCommitmentDate,
      permiso: ["AGREGAR_FECHA_COMPROMISO"], // Sin restricción de permiso
      estadosPermitidos:[1]
    },
    {
      label: "Reasignar Agente",
      icon: <FaUserEdit className="m-1 text-gray-500" />,
      action: onReassignTicket,
      permiso: ["REASIGNAR_USUARIO"],
      estadosPermitidos: [2, 1], // Permitido en estado 1 y 2
    },
    {
      label: "Reasignar Departamento",
      icon: <FaUserEdit className="m-1 text-gray-500" />,
      action: onReassignDepartment,
      permiso: ["REASIGNAR_DEPARTAMENTO"],
      estadosPermitidos: [2, 1],
    },
    {
      label: "Editar Ticket",
      icon: <FaPencilAlt className="m-1 text-gray-500" />,
      action: onEditTicket,
      permiso: ["EDITAR_TICKET"],
      estadosPermitidos: [2, 1],
    },
    {
      label: "Cambios recientes",
      icon: <BsClockHistory className="m-1" />,
      action: onRecentChanges,
      permiso: [],
    },
    {
      label: "Completar ticket",
      icon: <CiLock className="m-1 text-black" />,
      action: () => onChangeStatus(2),
      permiso: ["COMPLETAR_TICKET"],
      estadosPermitidos: [1],
    },
    {
      label: "Re-abrir ticket",
      icon: <CiUnlock className="m-1 text-black" />,
      action: () => onChangeStatus(1),
      permiso: ["REABRIR_TICKET"],
      estadosPermitidos: [2],
    },
    {
      label: "Cerrar ticket",
      icon: <CiLock className="m-1 text-black" />,
      action: () => onChangeStatus(3),
      permiso: ["CERRAR_TICKET"],
      estadosPermitidos: [2],
    },
    {
      label: "Marcar como No Autorizado",
      icon: <CiLock className="m-1 text-red-600" />,
      action: () => onMarkNotAuthorized(),
      permiso: ["TICKET_NO_AUTORIZADO"],
      estadosPermitidos: [1, 2], // Puedes ajustar los estados permitidos
    },
  ];

  // Nueva lógica de filtrado
  const filteredOptions = options.filter((option) => {
    // Si tiene restricción de estado, debe estar permitido
    if (option.estadosPermitidos && !option.estadosPermitidos.includes(ticketEstado)) {
      return false;
    }
    // Si tiene restricción de permiso, debe tener al menos uno
    if (option.permiso && option.permiso.length > 0) {
      return option.permiso.some((p) =>
        permissions.some((perm) => perm.nombre === p)
      );
    }
    // Si no tiene restricción de permiso, siempre se muestra
    return true;
  });

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Opciones del Ticket"
      >
        <FaEllipsisV />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-20 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1">
            {filteredOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action && option.action();
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskOptionsMenu;