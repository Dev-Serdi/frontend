import axios from "axios";
import { getAuthToken } from "./AuthService";
const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const accessToken = getAuthToken();
  if (!accessToken) {
    throw new Error("No access token found for API request.");
  }
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

export const fetchNotifications = (userId) => {
  if (!userId) {
    return Promise.reject(new Error("No userId provided for notifications fetch."));
  }
  return axios.get(`${REST_API_BASE_URL}/notifications/unreaded/${userId}`, getHeaders());
};

export const markNotificationAsSeen = (notificationId) => {
  if (!notificationId) {
    return Promise.reject(new Error("No notificationId provided to mark as seen."));
  }
  return axios.put(`${REST_API_BASE_URL}/notifications/seen/${notificationId}`, null, getHeaders());
}

export const fetchAllNotifications = (userId, page, size=10) => {
  if (!userId) {
    return Promise.reject(new Error("No userId provided for notifications fetch."));
  }
  const params = new URLSearchParams({page: page, size: size});
  return axios.get(`${REST_API_BASE_URL}/notifications/all/${userId}?${params.toString()}`, getHeaders())
}

export const deleteAllNotificationsForUser = (userId) =>
  axios.put(`${REST_API_BASE_URL}/notifications/setall/${userId}`,null, getHeaders());

