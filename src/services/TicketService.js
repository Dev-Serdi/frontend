import axios from "axios";
import { getAuthToken } from "./AuthService";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const accessToken = getAuthToken();
  if (!accessToken) {
    // Handle case where token is not available, maybe redirect to login or throw error
    console.warn("No access token found for API request.");
    // Depending on your app's logic, you might want to throw an error
    // or return empty headers, which will likely cause the API call to fail (401/403)
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

export const getTicketById = (ticketId) =>
  axios.get(`${REST_API_BASE_URL}/tickets/${ticketId}`, getHeaders());

/**
 * Lists tickets, optionally filtered by department. Fetches all statuses.
 * @param {number} page - The page number (0-indexed).
 * @param {string} [departamento=""] - Optional department ID to filter by.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const listTickets = async (page, size=8, departamento = "") => {
  // Use URLSearchParams for cleaner query string building
  const params = new URLSearchParams({
    page: page,
    size: size, // Your desired page size
  });

  // Append departamento only if it has a value
  if (departamento) {
    params.append("departamento", departamento); // Ensure backend expects 'departamento'
  }

  const url = `${REST_API_BASE_URL}/tickets/all?${params.toString()}`;

  try {
    return await axios.get(url, getHeaders());
  } catch (error) {
    if (!error.response) {
      console.error("Network Error or Server Down:", error.message);
      throw new Error("Error de conexión con el servidor");
    }
    console.error("API Error (listTickets):", error.response);
    throw error; // Re-throw the original error for further handling
  }
};

export const listTicketsByUser= (userId, page, size=8,estadoId=0) =>
  axios.get(`${REST_API_BASE_URL}/tickets/user/${userId}?page=${page}&size=${size}&estadoId=${estadoId}`, getHeaders());

export const listTicketsDashboard= (userId, page, size=8,estadoId=1) =>
  axios.get(`${REST_API_BASE_URL}/tickets/dashboard/user/${userId}?page=${page}&size=${size}&estadoId=${estadoId}`, getHeaders());

export const searchTickets= (busqueda) =>
  axios.get(`${REST_API_BASE_URL}/tickets/search?busqueda=${busqueda}`, getHeaders());

/**
 * Lists tickets filtered by status, optionally filtered by department.
 * @param {number} page - The page number (0-indexed).
 * @param {string} status - The status to filter by (e.g., 'pendiente'). Backend expects 'filtro'.
 * @param {string|number} [departamento=""] - Optional department ID to filter by.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const listFilteredTickets = async (page, status, departamento = "", size=8) => {
  // Use URLSearchParams
  const params = new URLSearchParams({
    page: page,
    size: size,
    // filtro: status, // Backend expects 'filtro' for status
  });
  if (status) {
    params.append("filtro", status); // Ensure backend expects 'filtro'
  }
  // Append departamento only if it has a value
  if (departamento) {
    params.append("departamento", departamento); // Ensure backend expects 'departamento'
  }

  const url = `${REST_API_BASE_URL}/tickets?${params.toString()}`;
  try {
    return await axios.get(url, getHeaders());
  } catch (error) {
    if (!error.response) {
      console.error("Network Error or Server Down:", error.message);
      throw new Error("Error de conexión con el servidor");
    }
    console.error("API Error (listFilteredTickets):", error.response);
    throw error; // Re-throw the original error
  }
};

export const listTrashedTickets = async (page) => {
  const params = new URLSearchParams({
    page: page,
    size: 8,
  });
  const url = `${REST_API_BASE_URL}/tickets/trashed?${params.toString()}`;
  try {
    return await axios.get(url, getHeaders());
  } catch (error) {
    if (!error.response) {
      console.error("Network Error or Server Down:", error.message);
      throw new Error("Error de conexión con el servidor");
    }
    console.error("API Error (listTrashedTickets):", error.response);
    throw error;
  }
};

export const deleteTicket = (ticketId) =>
  axios.delete(`${REST_API_BASE_URL}/tickets/${ticketId}`, getHeaders());

export const restoreTicket = (ticketId) =>
  //Se envia null debido a que la firma de axios.put es axios.put(url[,data[,config]]).
  //Debemos pasar el header como 3er argumento y no como 2do, mandando null de segundo argumento
  axios.put(
    `${REST_API_BASE_URL}/tickets/restore/${ticketId}`,
    null,
    getHeaders()
  );

// Función para crear un nuevo ticket
export const createTicket = (ticketData) =>
  axios.post(`${REST_API_BASE_URL}/tickets`, ticketData, getHeaders());

export const updateTicket = (id, ticketData) =>
  axios.put(`${REST_API_BASE_URL}/tickets/${id}`, ticketData, getHeaders());

export const updateTicketStatus = (id, estadoId, usuarioId) =>
  axios.put(`${REST_API_BASE_URL}/tickets/status/${id}?estadoId=${estadoId}&usuarioId=${usuarioId}`, null ,getHeaders());

export const reassignUser = (ticketId, usuarioId) =>
  axios.put(
    `${REST_API_BASE_URL}/tickets/reassign/user/${ticketId}?usuarioId=${usuarioId}`,
    null,
    getHeaders()
  );

export const reassignDepartment = (ticketId, usuarioId, incidenciaId, departamentoId) =>
  axios.put(
    `${REST_API_BASE_URL}/tickets/reassing/department/${ticketId}?usuarioId=${usuarioId}&incidenciaId=${incidenciaId}&departamentoId=${departamentoId}`,
    null,
    getHeaders()
  );

/**
 * Actualiza la fecha de compromiso de un ticket.
 * @param {number} ticketId - El ID del ticket a actualizar.
 * @param {string} commitmentDateString - La nueva fecha en formato string "YYYY-MM-DD".
 * @returns {Promise<AxiosResponse<any>>}
 */
export const updateCommitmentDate = (ticketId, commitmentDateString) => {
  // Asegúrate de que la URL coincide con tu endpoint en el backend
  const url = `${REST_API_BASE_URL}/tickets/commitment-date/${ticketId}`;

  // ✅ OBTENEMOS LA CONFIGURACIÓN BASE DE CABECERAS (QUE INCLUYE EL TOKEN)
  const config = getHeaders();

  // ✅ ESTABLECEMOS EXPLÍCITAMENTE EL CONTENT-TYPE A JSON
  config.headers['Content-Type'] = 'application/json';

  // ✅ CONVERTIMOS LA CADENA DE TEXTO A UN CUERPO JSON VÁLIDO
  // Esto transforma '2025-08-12' en '"2025-08-12"', que es lo que el backend espera.
  const body = JSON.stringify(commitmentDateString);

  // Enviamos la petición PUT con la URL, el cuerpo JSON y la configuración de cabeceras.
  return axios.put(url, body, config);
};

export const getTicketHistory = (ticketId) =>
  axios.get(`${REST_API_BASE_URL}/tickets/${ticketId}/history`, getHeaders());

export const markTicketNotAuthorized = (ticketId, usuarioId) =>
  axios.put(`${REST_API_BASE_URL}/tickets/notauth/${ticketId}?usuarioId=${usuarioId}`, null, getHeaders());

export const listTicketsByCriteria = (filters, page = 0, size = 6) => {
  const params = new URLSearchParams({ page, size });

  // Agrega solo los filtros que tienen un valor
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const url = `${REST_API_BASE_URL}/tickets/reporte-filtrado?${params.toString()}`;
  return axios.get(url, getHeaders());
};

export const listUbicaciones = () =>
  axios.get(`${REST_API_BASE_URL}/ubicaciones`, getHeaders());
// Agregado en: src/services/TicketService.js

export const listUnansweredTickets = (page, departamento = "",estadoNombre="",usuarioId="", size=8) => {
  const params = new URLSearchParams({
    page: page,
    size: size, // Manteniendo el tamaño de página consistente
  });
  if (departamento) {
    params.append("departamento", departamento);
  }
  if (estadoNombre){
    params.append("estadoNombre",estadoNombre)
  }
  if (usuarioId){
    params.append("usuarioId",usuarioId)
  }
  const url = `${REST_API_BASE_URL}/tickets/unanswered?${params.toString()}`;
  return axios.get(url, getHeaders());
};