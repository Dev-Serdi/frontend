import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTicketById, markTicketNotAuthorized } from "../../services/TicketService";
import {
  FaTicketAlt,
  FaInfoCircle,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import ChatContainer from "../../components/Chat/ChatContainer";
import {
  formatDateTime,
  getBadgeColor,
  getPriorityColor,
  getStatusLabel,
  getTicketAtrasado,
} from "../../utils/utils";
import CreateTicket from "../../components/Ticket/modal/CreateTicket.jsx";
import { getPermisos, getUserId} from "../../services/UsuarioService";
import TaskOptionsMenu from "../../components/Ticket/TaskOptionsMenu";
import { CommitmentDate } from "../../components/Ticket/modal/CommitmentDate.jsx";
import { ReassingTicket } from "../../components/Ticket/modal/ReassignTicket.jsx";
import { RecentChanges } from "../../components/Ticket/modal/RecentChanges.jsx";
import { FiArrowRight } from "react-icons/fi";
import { ChangeStatus } from "../../components/Ticket/modal/ChangeStatus.jsx";
import { ReassingDepartment } from "../../components/Ticket/modal/ReassingDepartment.jsx";
import { MarkNotAuthorizedModal } from "../../components/Ticket/modal/MarkNotAuthorizedModal.jsx";
import { listAllUbicaciones } from "../../services/UbicacionService.js";

/**
 * @component TaskDetails
 * @description Displays the complete details of a ticket, its associated chat, and provides options for ticket management.
 */
const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [isReassingModalOpen, setReassingModalOpen] = useState(false);
  const [isReassingDepartmentModalOpen, setReassingDepartmentModalOpen] = useState(false);
  const [isCommitmentModalOpen, setCommitmentModalOpen] = useState(false);
  const [recentChangesOpen, setRecentChangesOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [changeStatusTarget, setChangeStatusTarget] = useState(null);
  const [isMarkNotAuthorizedOpen, setMarkNotAuthorizedOpen] = useState(false);
  const [isSubmittingNotAuth, setSubmittingNotAuth] = useState(false);
  const [userId, setUserId] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);

  const fetchTicketData = useCallback(() => {
    setLoading(true);
    Promise.all([getPermisos(), getTicketById(id), getUserId()])
      .then(([permisosResponse, ticketResponse, userResponse]) => {
        setPermissions(permisosResponse.data || []);
        if (ticketResponse.data) {
          setTicket(ticketResponse.data);
          setUserId(userResponse.data)
          setError(null); // Clear previous errors
        } else {
          throw new Error("El ticket no tiene datos.");
        }
      })
      .catch((err) => {
        console.error("Error al cargar datos del ticket:", err);
        const errorMessage = err.response?.data?.error || err.message || "Error al cargar el ticket.";
        setError(errorMessage);
        setTicket(null); // Clear ticket data on error
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch ubicaciones al montar el componente
  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await listAllUbicaciones();
        setUbicaciones(res.data || []);
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };
    fetchUbicaciones();
  }, []);

  useEffect(() => {
    fetchTicketData();
  }, [id, fetchTicketData]);

  const handleEditTicket = () => {
      setEditModalOpen(true);
  };

  const handleAddCommitmentDate = () => {
    setCommitmentModalOpen(true);
  };

  const handleReassignTicket = () => {
    const hasPermission = permissions.some((p) => p.nombre.includes("REASIGNAR_TICKET"));
    if (!hasPermission){
      setReassingModalOpen(true);
    }
  };
  
  const handleReassignDepartment = () => {
      setReassingDepartmentModalOpen(true);
  };

  const handleRecentChanges = () => {
    setRecentChangesOpen(true);
  };

  const handleChangeStatus = (targetEstado) => {
    setChangeStatusTarget(targetEstado);
    setChangeStatusModalOpen(true);
  };
  
  const handleMarkNotAuthorized = () => {
    setMarkNotAuthorizedOpen(true);
  };

  const confirmMarkNotAuthorized = async () => {
    setSubmittingNotAuth(true);
    try {
      
      await markTicketNotAuthorized(ticket.id, userId);
      fetchTicketData();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingNotAuth(false);
      setMarkNotAuthorizedOpen(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-lg font-medium text-gray-600">
            Cargando detalles del ticket...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-gray-100">
        <div className="text-center bg-white rounded-lg shadow-xl p-4 max-w-lg">
          <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto m-5" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Error</h2>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="rounded flex items-center justify-center p-3 w-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaArrowLeft className="mr-2" />
            Volver a la lista de tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-6 lg:p-8">
      <div className="max-w-screen-2x1 mx-auto">
        <div className="mb-1">
          <button
            onClick={() => navigate(-1)}
            className="flex bg-blue-600 text-white rounded items-center text-sm font-medium p-2 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* --- Columna Izquierda: Detalles del Ticket --- */}
          <div className="lg:w-2/5z xl:w-3/5 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center p-2 border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaTicketAlt className="m-1 text-blue-600" />
                  Ticket:{" "}
                  <span className="m-1 font-mono text-blue-700 bg-blue-100 px-2 py-1 rounded text-lg">
                    {ticket.codigo || ticket.id}
                  </span>
                  <FiArrowRight/>
                  <span className="m-1 font-mono  px-2 py-1 rounded text-sm">
                    {ticket.fechaCompromiso ? "Fecha de compromiso: "+formatDateTime(ticket.fechaCompromiso, true) : "El agente no ha establecido una fecha de compromiso."}
                  </span>
                </h1>                
                  {(ticket?.estado === 1) 
                  ? (<p className="text-sm text-red-600 italic bg- bg-red-100 w-fit px-2 py-1 rounded mt-1">{getTicketAtrasado(ticket.fechaVencimiento, ticket.fechaCreacion)}</p>)
                  :(<p className="text-sm text-blue-600 italic bg- bg-blue-100 w-fit px-2 py-1 rounded mt-1">Ticket entregado.</p>)}
              </div>
              <TaskOptionsMenu
                onEditTicket={handleEditTicket}
                onAddCommitmentDate={handleAddCommitmentDate}
                onReassignDepartment={handleReassignDepartment}
                onReassignTicket={handleReassignTicket}
                onRecentChanges={handleRecentChanges}
                onChangeStatus={handleChangeStatus}
                onMarkNotAuthorized={handleMarkNotAuthorized}
                permissions={permissions}
                ticketEstado={ticket.estado}
              />
            </div>
            <div className="p-4 space-y-6">
              <DetailSection
                title="Información General"
                icon={<FaInfoCircle className="text-green-600" />}
              >
                <DetailItem label="Tema" value={ticket.tema} />
                <DetailItem
                  label="Estado"
                  value={getStatusLabel(ticket.estado, ticket.isAuthorized)}
                  badgeColor={getBadgeColor(ticket.estadoNombre)}
                />
                <DetailItem
                  label="Prioridad"
                  value={ticket.prioridadNombre}
                  badgeColor={getPriorityColor(ticket.prioridadNombre)}
                />
                <DetailItem
                  label="Departamento"
                  value={ticket.departamentoNombre}
                />
                <DetailItem
                  label="Incidencia"
                  value={ticket.incidenciaNombre}
                />
                {/* <DetailItem label="Fuente" value={ticket.fuenteNombre} /> */}
                <DetailItem
                  label="Ubicacion"
                  value={
                    (() => {
                      // ticket.ubicacion puede ser id o string
                      if (!ticket.ubicacion) return "Sin ubicación";
                      const ubicacionObj = ubicaciones.find(
                        (u) =>
                          u.id === ticket.ubicacion ||
                          u.id === Number(ticket.ubicacion)
                      );
                      return ubicacionObj
                        ? ubicacionObj.nombre
                        : typeof ticket.ubicacion === "string"
                        ? ticket.ubicacion
                        : "Sin ubicación";
                    })()
                  }
                />
                <DetailItem label="Descripción" value={ticket.descripcion} />
              </DetailSection>

              <DetailSection
                title="Detalles de Tiempo"
                icon={<FaCalendarAlt className="text-purple-600" />}
              >
                <DetailItem
                  label="Creado"
                  value={formatDateTime(ticket.fechaCreacion)}
                  icon={<FaClock className="text-gray-400" />}
                />
                <DetailItem
                  label="Modificado"
                  value={formatDateTime(ticket.fechaActualizacion)}
                  icon={<FaClock className="text-gray-400" />}
                />
                <DetailItem
                  label="Vencimiento"
                  value={formatDateTime(ticket.fechaVencimiento, true)}
                  icon={<FaClock className="text-gray-400" />}
                />
              </DetailSection>

              <DetailSection
                title="Usuarios"
                icon={<FaUser className="text-yellow-600" />}
              >
                <DetailItem
                  label="Creador"
                  value={<Link className="text-decoration-none" to={`/perfil/${ticket.usuarioCreador}`}>{ticket.usuarioCreadorNombres}</Link>|| "No asignado"}
                />
                <DetailItem
                  label="Asignado"
                  value={<Link className="text-decoration-none" to={`/perfil/${ticket.usuarioAsignado}`}>{ticket.usuarioAsignadoNombres}</Link> || "No asignado"}
                />
              </DetailSection>
            </div>
          </div>

          {/* --- Columna Derecha: Chat --- */}
          <div className="flex-1">
            <ChatContainer ticketId={id} chatId={ticket.chatId} estadoId={ticket?.estado}/>
          </div>
        </div>
      </div>
      <CreateTicket
        open={isEditModalOpen}
        setOpen={setEditModalOpen}
        ticket={ticket}
      />
      <CommitmentDate
        open={isCommitmentModalOpen}
        setOpen={setCommitmentModalOpen}
        ticketId={ticket.id}
        onCommitmentDateAdded={() => {
          setCommitmentModalOpen(false);
          fetchTicketData();
        }}
      />
      <ReassingDepartment
        open={isReassingDepartmentModalOpen}
        setOpen={setReassingDepartmentModalOpen}
        ticketId={ticket.id}
        onReassigned={() => {
          setReassingDepartmentModalOpen(false);
          fetchTicketData();
        }}
      />
      <ReassingTicket
        open={isReassingModalOpen}
        setOpen={setReassingModalOpen}
        deptoId={ticket.departamento}
        ticketId={ticket.id}
        onReassigned={() => {
          setReassingModalOpen(false);
          window.location.reload();
        }}
      />
      <RecentChanges
        open={recentChangesOpen}
        setOpen={setRecentChangesOpen}
        ticketId={ticket?.id}
      />
      <ChangeStatus
        open={isChangeStatusModalOpen}
        setOpen={setChangeStatusModalOpen}
        ticketId={ticket?.id}
        currentEstado={ticket?.estado}
        targetEstado={changeStatusTarget}
        onChangeStatus={() => fetchTicketData()}
      />
      <MarkNotAuthorizedModal
        open={isMarkNotAuthorizedOpen}
        setOpen={setMarkNotAuthorizedOpen}
        onConfirm={confirmMarkNotAuthorized}
        isSubmitting={isSubmittingNotAuth}
      />
    </div>
  );
};

const DetailSection = ({ title, icon, children }) => (
  <section>
    <div className="flex items-center mb-2 border-b border-gray-200 pb-1">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        {icon && React.cloneElement(icon, { className: "mr-3 w-5 h-5" })}
        {title}
      </h3>
    </div>
    <div className="space-y-3 pl-1">{children}</div>
  </section>
);

const DetailItem = ({ label, value, badgeColor, icon }) => (
  <div className="grid grid-cols-3 gap-x-4 items-start">
    <dt className="text-sm font-medium text-gray-500 col-span-1 truncate">
      {label}:
    </dt>
    <dd className="text-sm text-justify text-gray-900 col-span-2 flex items-center">
      {icon &&
        React.cloneElement(icon, {
          className: "mr-2 w-4 h-4 text-gray-400 flex-shrink-0",
        })}
      {badgeColor ? (
        <span
          className={`px-2 py-1 rounded-full font-semibold text-xs leading-tight ${badgeColor}`}
        >
          {value || "N/A"}
        </span>
      ) : (
        value || <span className="text-gray-400 italic">No especificado</span>
      )}
    </dd>
  </div>
);



export default TaskDetails;
