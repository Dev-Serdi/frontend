import React, { useEffect, useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
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
} from "../../utils/utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../../components/Users/UserInfo";
import Button from "../../components/Button";
import ConfirmationDialog from "../../components/Ticket/modal/ConfirmationDialog";
import { restoreTicket, listTrashedTickets } from "../../services/TicketService";
import { Link } from "react-router-dom";

const ICONS = {
  1: <MdKeyboardDoubleArrowUp />,
  2: <MdKeyboardArrowUp />,
  3: <MdKeyboardArrowDown />,
};

const Trash = ( ) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tickets, setTickets] = useState([]);
  const isAuth = localStorage.getItem("authToken");
    const [pagina, setPagina] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorConexion, setErrorConexion] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    // const [permisos, setPermisos] = useState([]); // Removed if not used
    const [selected, setSelected] = useState(() => {
      const saved = localStorage.getItem("selectedTab");
      return saved !== null ? Number(saved) : 0;
    }
  );
  
  useEffect(() => {
    localStorage.setItem('selectedTab', selected);
      const fetchTickets = async () => {
        // await getAllTickets();
          setLoading(true); // Mostrar el spinner de carga
          try {
            const response = await listTrashedTickets(pagina); // Llama al servicio para obtener los usuarios
            setTickets(response.data.content); // Actualiza el estado con la lista de usuarios
            setTotalPages(response.data.totalPages); // Actualiza el estado con la lista de usuarios)
          } catch (error) {
            setErrorConexion(error != null); // Indica que hubo un error de conexión
          } finally {
            setLoading(false); // Oculta el spinner de carga
          }
      };
      if (isAuth) fetchTickets();
    }, [isAuth, pagina, selected]);

  const restoreClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const restoreHandler = () => {
    restoreTicket(selected);
    setOpenDialog(false);
    window.location.reload();
  };

  const TableHeader = () => (
    <thead className="w-full border-b border-gray-300">
      <tr className="w-full text-black  text-left">
        <th className="py-2">Titulo</th>
        <th className="py-2">Prioridad</th>
        <th className="py-2 line-clamp-1">Creado</th>
        <th className="py-2">Vencimiento</th>
        <th className="py-2">Assets</th>
      </tr>
    </thead>
  );

  const TableRow = ({ ticket }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-300/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TICKET_TYPE[ticket.estado])}
          />
          <Link to={`/helpdesk/task/${ticket.id}`} className="w-full line-clamp-2 text-base text-black text-decoration-none">
            {ticket?.tema}
          </Link>
        </div>
      </td>

      <td className="py-2">
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[ticket?.prioridad])}>
            {ICONS[ticket?.prioridad]}
          </span>
          <span
            className={clsx(
              "capitalize line-clamp-1",
              PRIOTITYSTYELS[ticket?.prioridad]
            )}
          >
            Prioridad {PRIORITYNAMES[ticket?.prioridad]}
          </span>
        </div>
      </td>

      <td className="py-2">
        <span className="text-sm text-gray-600">
          {formatDate(new Date(ticket?.fechaCreacion))}
        </span>
      </td>
      <td className="py-2">
        <span className="text-sm text-gray-600">
          {getVencimiento(new Date(ticket?.fechaVencimiento))}
        </span>
      </td>

      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 items-center text-sm text-gray-600">
            <BiMessageAltDetail />
            <span>{ticket?.activities?.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
            <MdAttachFile />
            <span>{ticket?.assets?.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
            <FaList />
            <span>0/{ticket?.subtickets?.length}</span>
          </div>
        </div>
      </td>

      <td className="py-2">
        <div className="flex">
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

      <td className="py-2 flex gap-2 md:gap-4 justify-end">
        <Button
          className="text-green-700 hover:text-red-500 sm:px-0 text-sm md:text-base"
          label="Recuperar"
          type="button"
          onClick={() => restoreClicks(ticket.id)}
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="bg-white  px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
        <div className="overflow-x-auto">
          <table className="w-full ">
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
        type="restore"
        msg={"Quieres recuperar este ticket?"}
        onClick={restoreHandler}
      />
    </>
  );
};

export default Trash;
