import { LogLevel } from "@azure/msal-browser";
import { get } from "react-hook-form";

/**
 * Formatea el rol del usuario para mostrar un nombre legible.
 * @param {string} rolId - ID del rol del usuario.
 * @returns {string} Nombre del rol.
 */
export const formatUserRole = (rol) => {
  switch (rol) {
    case "ROLE_ADMIN":
        return "Administrador";
    case 'ROLE_USER':
        return "Usuario";
    case "ROLE_AGENT":
        return "Agente";
    case "ROLE_SUPERVISOR":
        return "Supervisor";
    default:
        return "Desconocido";
    }
};

export const formatUserModulo = (modulo) => {
  switch (modulo) {
    case "GESTION": 
      return "Gestión Documental";
    case "HELPDESK":
      return "Mesa de Ayuda";
  }
}

//retorna lo mismo que la funcion de arriba, solamente que con su respectivo sistema
export const formatUserRoleWithSystem = (rol) => {
  switch (rol) {
    case "ROLE_ADMIN":
        return "Administrador";
    case 'ROLE_USER':
        return "Usuario - Gestión documental";
    case "ROLE_AGENT":
        return "Agente - Mesa de ayuda";
    case "ROLE_SUPERVISOR":
        return "Supervisor - Ambos sistemas";
    default:
        return "Desconocido";
    }
};
  
  /**
   * Constantes que contiene todos los roles de la aplicacion
   */
  // const fetchRoles = await listRol();

  /**
   * Mensaje de error por defecto
   */
  export const DEFAULT_ERROR_MESSAGE = "Error de conexión con el servidor. Intente nuevamente más tarde.";
  
  /**
   * Funcion que se encarga de manejar los errores de la API.
   * @param {*} error - El error que se produjo en la api
   * @param {string} defaultMessage - El mensaje que debe mostrar si el error no viene especificado.
   */
  export const handleApiError = (error, defaultMessage = "An error occurred") => {
    console.error("API error:", error);
    if (error.response && error.response.data) {
      // Show the error from the backend if available
      alert(`${defaultMessage}: ${error.response.data.message || ""}`);
    } else {
      alert(defaultMessage);
    }
  };

  export const getCierre = (fechaCierre) => {
    if (fechaCierre===null || fechaCierre===undefined || !(fechaCierre instanceof Date) || isNaN(fechaCierre.getTime())) {
      return "Ticket en curso.";
    }
    
    const now = new Date();

    const diffInMs = fechaCierre.getTime() - now.getTime();
    const minuteInMs = 60 * 1000;
    const hourInMs = 60 * minuteInMs;
    const dayInMs = 24 * hourInMs;

    const absDiffInMs = Math.abs(diffInMs);

    if (absDiffInMs >= dayInMs) {
      const dias = Math.floor(absDiffInMs / dayInMs);
      return `Cerrado hace ${dias} día${dias > 1 ? "s" : ""}`;
    } else if (absDiffInMs >= hourInMs) {
      const hours = Math.floor(absDiffInMs / hourInMs);
      return `Cerrado hace ${hours} hora${hours > 1 ? "s" : ""}`;
    } else if (absDiffInMs >= minuteInMs) {
      const minutes = Math.floor(absDiffInMs / minuteInMs);
      return `Cerrado hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    } else {
      return "Cerrado hace poco";
    }
  };

  export const getTicketAtrasado = (fechaVencimiento, fechaCreacion) =>{
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setDate(vencimiento.getDate() + 1);
    vencimiento.setHours(23,59,59,999)
    const creacion = new Date(fechaCreacion);
    const atrasado = (vencimiento.getTime() - creacion.getTime()) / (1000 * 60 * 60 * 24);
    if (atrasado>0) return getVencimiento(vencimiento);
    return "Atrasado";
  } 

  export const getVencimiento = (expirationDate) => {
    let dateObj = expirationDate;
    // Si es string en formato YYYY-MM-DD, crea la fecha local al inicio del día
    if (typeof expirationDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
      const [year, month, day] = expirationDate.split("-");
      dateObj = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59); // Inicio del día local
    } else if (typeof expirationDate === "string") {
      dateObj = new Date(expirationDate);
    }

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.error("getVencimientoStatus received an invalid date:", expirationDate);
      return "Invalid Date";
    }

    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const minuteInMs = 60 * 1000;
    const hourInMs = 60 * minuteInMs;
    const dayInMs = 24 * hourInMs;
    const absDiffInMs = Math.abs(diffInMs);

    if (absDiffInMs >= dayInMs) {
      const dias = Math.floor(absDiffInMs / dayInMs);
      return diffInMs > 0
        ? `Expira en ${dias} día${dias > 1 ? 's' : ''}`
        : `Expiró hace ${dias} día${dias > 1 ? 's' : ''}`;
    } else if (absDiffInMs >= hourInMs) {
      const hours = Math.floor(absDiffInMs / hourInMs);
      return diffInMs > 0
        ? `Expira en ${hours} hora${hours > 1 ? 's' : ''}`
        : `Expiró hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (absDiffInMs >= minuteInMs) {
      const minutes = Math.floor(absDiffInMs / minuteInMs);
      return diffInMs > 0
        ? `Expira en ${minutes} minuto${minutes > 1 ? 's' : ''}`
        : `Expiró hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      return diffInMs > 0 ? "Expira pronto" : "Expiró hace poco";
    }
  };

  export function formatDate(date) {
    
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return ""; // Fecha inválida
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  }
  
  export function dateFormatter(dateString) {
    const inputDate = new Date(dateString);
  
    if (isNaN(inputDate)) {
      return "Invalid Date";
    }
  
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, "0");
    const day = String(inputDate.getDate()).padStart(2, "0");
  
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  
  export function getInitials(fullName) {
    const names = fullName.split(" ");
  
    const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());
  
    const initialsStr = initials.join("");
  
    return initialsStr;
  }

  export const getBadgeColor = (statusName) => {
  const lowerStatus = String(statusName ?? "").toLowerCase();
  switch (lowerStatus) {
    case "en-proceso":
      return "bg-yellow-100 text-yellow-800";
    case "completados":
      return "bg-blue-100 text-blue-800";
    case "cerrados":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPriorityColor = (priorityName) => {
  const lowerPriority = String(priorityName ?? "").toLowerCase();
  switch (lowerPriority) {
    case "alta":
      return "bg-red-100 text-red-800";
    case "media":
      return "bg-yellow-100 text-yellow-800";
    case "baja":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};  
  
  export const PRIORITYNAMES = {
    1: "Alta",
    2: "Media",
    3: "Baja",
  };
  

  export const PRIOTITYSTYELS = {
    1: "text-red-600",
    2: "text-yellow-600",
    3: "text-blue-600",
  };
  
  export const TICKET_TYPE = {
    1: "bg-yellow-500",
    2: "bg-blue-500",
    3: "bg-gray-600",
    4: "bg-red-600",
  };
  
  export const BGS = [
    "bg-blue-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-green-600",
  ];
  export const TASK_TYPE = {
    "en-proceso": "bg-yellow-600", 
    "completados": "bg-green-600", 
    "cerrados": "bg-green-600", 
  };
  
  // Función para formatear fechas en DD/MM/YYYY
  export const formatFecha = (fechaString) => {
    if (!fechaString) return "NA";
    const fecha = new Date(fechaString);
    // Comprueba si la fecha es válida
    if (isNaN(fecha.getTime())) {
      return "Fecha inválida";
    }
    return fecha.toLocaleDateString("es-ES", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Función para calcular el tiempo restante o vencido desde la fecha de compromiso
  export const getDiasCompromiso = (fechaCompromiso) => {
    if (!fechaCompromiso) return "NA";
    const fechaCompromisoDate = new Date(fechaCompromiso);
    const ahora = new Date();
  
    if (isNaN(fechaCompromisoDate.getTime())) {
      return "Fecha inválida";
    }
  
    const diffMs = fechaCompromisoDate.getTime() - ahora.getTime();
    const diffAbsMs = Math.abs(diffMs);
  
    const diffTotalMinutos = diffAbsMs / (1000 * 60);
    const diffTotalHoras = diffTotalMinutos / 60;
    const diffTotalDias = diffTotalHoras / 24;
  
    let unidad = "";
    let valor = 0;
  
    if (diffTotalDias >= 30) {
      valor = Math.floor(diffTotalDias / 30);
      unidad = "mes(es)";
    } else if (diffTotalDias >= 7) {
      valor = Math.floor(diffTotalDias / 7);
      unidad = "semana(s)";
    } else if (diffTotalDias >= 1) {
      valor = Math.floor(diffTotalDias);
      unidad = "día(s)";
    } else if (diffTotalHoras >= 1) {
      valor = Math.floor(diffTotalHoras);
      unidad = "hora(s)";
    } else {
      valor = Math.round(diffTotalMinutos);
      unidad = "minuto(s)";
    }
  
    if (valor === 0) {
      return "Vence en breve";
    }
  
    if (diffMs < 0) {
      return `Vencido por ${valor} ${unidad}`;
    }
  
    return `Faltan ${valor} ${unidad}`;
  };
  
  export const getFechaRespuesta = (fechaCreacion, fechaRespuesta) => {
    if (!fechaRespuesta) return "NA";
    const fechaRespuestaDate = new Date(fechaRespuesta);
    const ahora = new Date(fechaCreacion);
  
    if (isNaN(fechaRespuestaDate.getTime())) {
      return "Fecha inválida";
    }
    
    const diffMs = fechaRespuestaDate.getTime() - ahora.getTime();
    const diffAbsMs = Math.abs(diffMs);
    
    const diffTotalMinutos = diffAbsMs / (1000 * 60);
    const diffTotalHoras = diffTotalMinutos / 60;
  
    let unidad = "";
    let valor = 0;
  
    if (diffTotalHoras >= 1) {
    valor = Math.floor(diffTotalHoras);
    unidad = "hora(s)";
    return +valor+" "+unidad;
    }
    else {
    valor = Math.round(diffTotalMinutos);
    unidad = "minuto(s)";
    }
    return "Menos de una hora";
  };

  export const getStatusLabel = (status, authorized) => {
    switch (status) {
      case 1:
        return "En Proceso";
      case 2:
        return "Completado";
      case 3:
        if (!authorized) {
          return "No autorizado";
        }
        return "Cerrado";
      default:
        return status;
    }
  }
  export const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1:
        return "Alta";
      case 2:
        return "Media";
      case 3:
        return "Baja";
      default:
        return "Desconocida";
    }
  };

  export const formatDateTime = (dateTimeString, isDueDate = false) => {
  if (!dateTimeString) return "NA";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };

    if (!isDueDate) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      delete options.timeZone; // Use local timezone for timestamps
    }
    return date.toLocaleDateString("es-ES", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateTimeString;
  }
};