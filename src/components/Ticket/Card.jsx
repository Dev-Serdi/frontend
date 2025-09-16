import clsx from "clsx";
import React, { memo} from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import {
  BGS,
  PRIOTITYSTYELS,
  PRIORITYNAMES,
  TICKET_TYPE,
  formatDate,
  getVencimiento,
  getCierre,
} from "../../utils/utils";
import { BiMessageAltDetail } from "react-icons/bi";
import UserInfo from "../Users/UserInfo";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { IoLocationOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const ICONS = {
  1: <MdKeyboardDoubleArrowUp />,
  2: <MdKeyboardArrowUp />,
  3: <MdKeyboardArrowDown />,
};

const Card = ({ ticket }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="w-full h-full  bg-white shadow-md p-4 rounded-xl relative">
        <div className="w-full flex justify-evenly items-center ">
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[ticket?.prioridad]
            )}
          >
            <span className="text-lg">{ICONS[ticket?.prioridad]}</span>
            <span className="uppercase">
              prioridad {PRIORITYNAMES[ticket?.prioridad]}{" "}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between mt-2">
          <div>
            <Link
              to={`/helpdesk/task/${ticket.id}`}
              className="flex items-center gap-2 hover:text-blue-700 text-decoration-none"
            >
              <div
                className={clsx(
                  "w-4 h-4 rounded-full mt-1",
                  TICKET_TYPE && ticket?.estado
                    ? TICKET_TYPE[ticket.estado]
                    : "bg-gray-400"
                )}
              />
              <span className="font-semibold text-xl line-clamp-1 text-black">
                {ticket?.tema}
              </span>
            </Link>
            <div className="mt-1">
              {ticket?.estado == 1 && (
                <>
                  <span className="text-sm text-gray-600">
                    Creado: {formatDate(new Date(ticket?.fechaCreacion))}
                  </span>
                  <br />
                  <span className="text-sm text-red-600">
                    Vence: {ticket?.fechaVencimiento}
                    <span className="m-1 underline">
                      <br />
                      {getVencimiento(ticket?.fechaVencimiento)}
                    </span>
                  </span>
                </>
              )}
              {ticket?.estado >= 2 && (
                <>
                  <span className="text-sm text-gray-600">
                    Creado: {formatDate(new Date(ticket?.fechaCreacion))}
                  </span>
                  <br />
                  <span className="text-sm text-blue-500">
                    Ticket cerrado el:{" "}
                    {formatDate(new Date(ticket?.fechaCierre))}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {getCierre(new Date(ticket?.fechaCierre))}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <BiMessageAltDetail />
              <span>
                Area:{" "}
                <span className="text-decoration-underline">
                  {ticket?.departamentoNombre}
                </span>
              </span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600 ">
              <span className="font-bold">#</span>
              <span>{ticket?.codigo}</span>
            </div>
          </div>

          <div className="flex flex-row-reverse">
            <div
              key={ticket?.id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[ticket?.id % BGS?.length]
              )}
            >
              <UserInfo
                name={ticket?.usuarioAsignadoNombres}
                departamento={ticket?.departamentoNombre}
                id={ticket?.usuarioAsignado}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row text-sm text-gray-600">
          <IoLocationOutline />Ubicacion: {ticket.ubicacion != null ? ticket?.ubicacion : "Sin Ubicacion"}
        </div>
        <div className="">
          <div className="h-fit overflow-hidden text-base line-clamp-1 text-gray-700">
            {ticket?.descripcion}
          </div>
        </div>

        {/* Sección de acciones principales */}
        <div className="w-full pt-3 mt-2 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/helpdesk/task/${ticket.id}`)}
              className="w-full flex gap-2 items-center justify-center px-4 py-2 text-sm text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <IoMdAdd className="text-lg" />
              <span className="">REVISAR TICKET</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

Card.propTypes = {
  userId: PropTypes.number,
  ticket: PropTypes.object,
  onTicketStatusChange: PropTypes.func,
};
export default memo(Card);