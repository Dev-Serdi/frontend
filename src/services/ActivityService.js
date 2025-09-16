import axios from "axios";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the token from localStorage
const token = () => localStorage.getItem("authToken");
// Basic check if token exists and is valid JSON before parsing
const getAuthToken = () => {
  const storedToken = token();
  if (storedToken) {
    try {
      const parsedToken = JSON.parse(storedToken);
      return parsedToken?.accessToken; // Use optional chaining
    } catch (e) {
      console.error("Error parsing auth token from localStorage", e);
      return null; // Handle parsing error
    }
  }
  return null; // Handle case where token doesn't exist
};

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

export const createActivity = (activity) => axios.post(`${REST_API_BASE_URL}/activities/save`, activity, getHeaders());

// Nueva función para obtener todas las actividades
export const getAllActivities = () => axios.get(`${REST_API_BASE_URL}/activities/`, getHeaders());
export const deleteActivity = (id) =>
  axios.delete(`${REST_API_BASE_URL}/activities/${id}`, getHeaders());


//export const updateActivity = (activity) =>
  //axios.put(`${REST_API_BASE_URL}/activities/${activity.id}`, activity, getHeaders());

export const updateActivity = (activity) =>
  axios.post(`${REST_API_BASE_URL}/activities/save`, activity, getHeaders());

export const getDeletedActivities = () =>
  axios.get(`${REST_API_BASE_URL}/activities/eliminadas`, getHeaders());

export const restoreActivity = (id) =>
  axios.put(`${REST_API_BASE_URL}/activities/restaurar/${id}`, null, getHeaders());

