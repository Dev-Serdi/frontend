import axios from "axios";
const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Helper function to get the token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");

// Function to create headers with the Authorization token
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});
const prioridad = () =>
  axios.get(REST_API_BASE_URL, "/prioridad", getHeaders());

const prioridadMap = new Map();

prioridadMap.set(prioridad);
