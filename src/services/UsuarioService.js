import axios from "axios";
import { getAuthToken } from "./AuthService";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Function to create headers with the Authorization token
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

export const listUsers = (departamento,currentPage, itemsPerPage, searchTerm, modulo=0) => {
  if (departamento) {
    return axios
      .get(
        `${REST_API_BASE_URL}/users/departamento/${departamento}?page=${currentPage}&size=${itemsPerPage}&searchTerm=${searchTerm}`,
        getHeaders()
      ) // Add headers to the request
      .then((response) => response)
      .catch((error) => {
        if (!error.response) {
          throw new Error("Error de conexion con el servidor");
        }
        throw error;
      });
  }

  return axios
    .get(`${REST_API_BASE_URL}/users?page=${currentPage}&size=${itemsPerPage}&searchTerm=${searchTerm}&moduloId=${modulo}`, getHeaders()) // Add headers to the request
    .then((response) => response)
    .catch((error) => {
      if (!error.response) {
        throw new Error("Error de conexion con el servidor");
      }
      throw error;
    });
};

export const listUsersByDepartamento = (departamento) =>
  axios.get(`${REST_API_BASE_URL}/users/departamento/${departamento}`, getHeaders());

export const signUp = (userData) =>
  axios.post(`${REST_API_BASE_URL}/auth/signup`, userData);

export const getUserById = (userId) =>
  axios.get(`${REST_API_BASE_URL}/users/${userId}`, getHeaders());

export const getUserByEmail = () =>
  axios.get(`${REST_API_BASE_URL}/users/me/email`, getHeaders());

export const updateUser = (userId, user) =>
  axios.put(`${REST_API_BASE_URL}/users/edit/${userId}`, user, getHeaders());

export const deleteUser = (userId) =>
  axios.delete(`${REST_API_BASE_URL}/users/delete/${userId}`, getHeaders());

export const getUserPermissions = async () => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/users/permisos`,
    getHeaders()
  );
  return response;
};

export const checkOrCreateUser = (userData) =>
  axios.post(
    `${REST_API_BASE_URL}/users/check-or-create`,
    userData,
    getHeaders()
  );

export const login = (loginData) =>
  axios.post(`${REST_API_BASE_URL}/auth/login`, loginData);

export const logout = () =>
  axios.post(`${REST_API_BASE_URL}/auth/logout`,null, getHeaders());

export const getUserRoles = () => {
  return axios
    .get(`${REST_API_BASE_URL}/users/email/roles`, getHeaders())
    .then((response) => response)
    .catch((error) => {
      if (!error.response) {
        console.error(error);
        throw new Error("Error de conexion con el servidor");
      }
      throw error;
    });
};

export const getUserId = () =>
  axios.get(`${REST_API_BASE_URL}/users/me/id`, getHeaders());

export const getPermisos = () =>
  axios.get(`${REST_API_BASE_URL}/users/permisos`, getHeaders());

export const listAllModulos = () =>
  axios.get(`${REST_API_BASE_URL}/modulos`, getHeaders());

export const listAllPermisos = () =>
  axios.get(`${REST_API_BASE_URL}/permisos`, getHeaders());

export const getMisPreferencias = () => {
  return axios.get(`${REST_API_BASE_URL}/usuarios/preferencias/me`, getHeaders());
};

/**
 * Actualiza las preferencias de notificación activas para el usuario actual.
 * @param {Set<string>} preferenciasActivas - Un conjunto de strings con los nombres de las notificaciones a activar.
 */
export const updateMisPreferencias = (preferenciasActivas) => {
  // Convertimos el Set a un Array para que se pueda enviar como JSON
  const payload = Array.from(preferenciasActivas);
  return axios.put(`${REST_API_BASE_URL}/usuarios/preferencias/me`, payload, getHeaders());
};