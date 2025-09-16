import axios from "axios"
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

export const listAllUbicaciones = () =>
    axios.get(`${REST_API_BASE_URL}/ubicaciones`, getHeaders())

export const createUbicacion = (ubicacion) =>
    axios.post(`${REST_API_BASE_URL}/ubicaciones`,ubicacion ,getHeaders())

export const getUbicacionById = (id) =>
    axios.get(`${REST_API_BASE_URL}/ubicaciones/${id}`, getHeaders())

export const updateUbicacion = (id, ubicacion) =>
    axios.put(`${REST_API_BASE_URL}/ubicaciones/${id}`, ubicacion, getHeaders())