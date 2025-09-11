import axios from "axios";
import { getAuthToken } from "./AuthService";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the token from localStorage
// Function to create headers with the Authorization token
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const listRol = () =>
  axios
    .get(REST_API_BASE_URL+"/roles", getHeaders())
    .then((response) => response)
    .catch((error) => {
      // Detectamos específicamente errores de conexión
      if (!error.response) {
        throw new Error("Error de conexion con el servidor");
      }
      throw error;
    });
