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

export const listAllIps = (page, size, param) => {
  const params = new URLSearchParams({
    page: page,
    size: size,
  });

  if (param) {
    params.append('param', param);
  }

  return axios.get(`${REST_API_BASE_URL}/ip?${params.toString()}`, getHeaders());
};

export const postIp = (ip) =>
  axios.post(`${REST_API_BASE_URL}/ip`, ip, getHeaders());

export const getIpByUserId = (usuarioId, page, size) =>
  axios.get(`${REST_API_BASE_URL}/ip/${usuarioId}?page=${page}&size=${size}`, getHeaders());
