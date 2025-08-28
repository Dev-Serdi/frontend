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

export const createPrioridad = (prioridad) =>
  axios.post(`${REST_API_BASE_URL}/prioridades`, prioridad, getHeaders());

export const listAllPrioridades = () => {
  return axios.get(`${REST_API_BASE_URL}/prioridades`, getHeaders());
};

export const deletePrioridad = (id) => {
  return axios.delete(`${REST_API_BASE_URL}/prioridad/${id}`, getHeaders());
};
