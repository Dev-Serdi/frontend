import axios from "axios";
import { getAuthToken } from "./AuthService";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const accessToken = getAuthToken();
  return accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : { headers: {} }; // para evitar enviar undefined
};


// === Endpoints ===
export const getSitios = () =>
  axios.get(`${REST_API_BASE_URL}/sitios`, getHeaders());
export const getSitioById = (id) =>
  axios.get(`${REST_API_BASE_URL}/sitios/${id}`, getHeaders());
export const createSitio = (sitioDto) =>
  axios.post(`${REST_API_BASE_URL}/sitios`, sitioDto, getHeaders());
export const updateSitio = (id, sitioDto) =>
  axios.put(`${REST_API_BASE_URL}/sitios/${id}`, sitioDto, getHeaders());
export const deleteSitio = (id) =>
  axios.delete(`${REST_API_BASE_URL}/sitios/${id}`, getHeaders());
export const getSitiosByUser = (userId) =>
  axios.get(`${REST_API_BASE_URL}/sitios/usuario/${userId}`, getHeaders());
export const getSitiosVisibles = () =>
  axios.get(`${REST_API_BASE_URL}/sitios/visibles`, getHeaders());


export const getUsuariosAsignados = (sitioId) =>
  axios.get(`${REST_API_BASE_URL}/sitios/${sitioId}/usuarios`, getHeaders());

export const agregarUsuariosAsignados = (sitioId, userIds) =>
  axios.post(`${REST_API_BASE_URL}/sitios/${sitioId}/usuarios`, userIds, getHeaders());

export const getSitiosEliminados = () =>
  axios.get(`${REST_API_BASE_URL}/sitios/eliminados`, getHeaders());

export const restaurarSitio = (id) =>
  axios.put(`${REST_API_BASE_URL}/sitios/restaurar/${id}`, null, getHeaders());
