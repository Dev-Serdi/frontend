import React, { useState, memo } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { BGS, PRIOTITYSTYELS, PRIORITYNAMES, TICKET_TYPE, formatDate, getVencimiento, getStatusLabel, getCierre } from "../../utils/utils";
import clsx from "clsx";
import UserInfo from "../../components/Users/UserInfo";
import Button from "../Button";
import ConfirmationDialog from "./modal/ConfirmationDialog";
import { deleteTicket } from "../../services/TicketService";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getUserRoles } from "../../services/UsuarioService";

const ICONS = {
  1: <MdKeyboardDoubleArrowUp />,
  2: <MdKeyboardArrowUp />,
  3: <MdKeyboardArrowDown />,
};

const  Table = ({tickets, userId}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getUserRoles();
        setRoles(response.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  const deleteClicks = (id) => {
    if (roles === "ROLE_ADMIN") {
      setSelected(id);
      setOpenDialog(true);
    }
    else alert("No tienes permisos para eliminar tickets");
  };

  const deleteHandler = () => {
    deleteTicket(selected);
    setOpenDialog(false);
    window.location.reload();
  };

  const TableHeader = () => (
    <thead className='w-full border-gray-300'>
      <tr className='w-full text-black text-left'>
        <th className='py-2 p-1'>Titulo</th>
        <th className='py-2 p-1'>Prioridad</th>
        <th className='py-2 p-1'>Departamento</th>
        <th className='py-2 p-1'>Creado</th>
        <th className='py-2 p-1'>Vencimiento</th>
        <th className='py-2 p-1'>Estado</th>
      </tr>
    </thead>
  );

  const TableRow = ({ ticket }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
      <td className='py-2'>
        <div className='flex items-left gap-2'>
          <div
          style={{minWidth:"5px", minHeight:"5px"}}
            className={clsx("w-5 h-5 rounded-full", TICKET_TYPE[ticket.estado])}
          />
          <Link to={`/helpdesk/task/${ticket.id}`} className='text-decoration-none w-full line-clamp-2 text-base text-black'>
            {ticket?.tema}
          </Link>
        </div>
      </td>

      <td className='py-2'>
        <div className={"flex gap-1 items-center"}>
          <div className={clsx("text-lg", PRIOTITYSTYELS[ticket?.prioridad])}>
            {ICONS[ticket?.prioridad]}
          </div>
          <div className={clsx("capitalize line-clamp-1", PRIOTITYSTYELS[ticket?.prioridad])}>
            Prioridad {PRIORITYNAMES[ticket?.prioridad]} 
          </div>
        </div>
      </td>
      <td className='py-2'>
        <div className='text-sm text-gray-600'>
          {ticket?.departamentoNombre}
        </div>
      </td>
      <td className='py-2'>
        <div className='text-sm text-gray-600'>
          {formatDate(new Date(ticket?.fechaCreacion))}
        </div>
      </td>
      <td className='py-2'>
        <div className='text-sm text-gray-600'>

          {
          ticket?.estado === 1 
          ? getVencimiento(new Date(ticket?.fechaVencimiento))
          : getCierre(new Date(ticket?.fechaCierre))}
        </div>
      </td>

      <td className='py-2'>
        <div className='flex items-center gap-3'>
          <div className='flex gap-1 items-center text-sm text-gray-600'>
            <BiMessageAltDetail />
            <div>{getStatusLabel(ticket?.estado, ticket?.isAuthorized)}</div>
          </div>
        </div>
      </td>

      <td className='py-2'>
        <div className='flex'>
          {ticket?.team?.map((m, index) => (
            <div
              key={m._id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>
      <td className='py-2 flex gap-2 md:gap-4 justify-end'>
        <Button
          className='text-red-700 hover:text-red-500 sm:px-0 text-sm md:text-base'
          label='Eliminar'
          type='button'
          onClick={() => deleteClicks(ticket.id)}
        />
      </td>
    </tr>
  );
  
  return (
    <>
      <div className='bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded'>
        <div className='overflow-x-auto'>
          <table className='w-full '>
            <TableHeader />
            <tbody>
              {tickets.map((ticket, index) => (
                <TableRow key={index} ticket={ticket} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TODO */}
      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
};

export default memo(Table);