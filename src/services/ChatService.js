import axios from "axios";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the token from localStorage
const token = () => localStorage.getItem("authToken");
const getAuthToken = () => JSON.parse(token()).accessToken;

// Function to create headers with the Authorization token
const getHeaders = () => ({  
    headers: {
        Authorization: `Bearer ${getAuthToken()}`,
    },
});


// Function to get messages (assuming it exists and works with ticketId)
export const listMessages = (ticketId) => {
    // Ensure backend endpoint matches: /api/tickets/{ticketId}/chat/messages (GET)
    return axios.get(`${REST_API_BASE_URL}/tickets/${ticketId}/chat/messages?page=0&size=1000`, getHeaders());
};

// --- NEW FUNCTION ---
// Function to post a message (text and/or file)
export const postChatMessage = (ticketId, messageContent, file) => {
    const formData = new FormData();
    
    // 1. Crear Blob para la parte JSON
    const messageDto = { content: messageContent };
    const messageBlob = new Blob(
        [JSON.stringify(messageDto)], 
        { type: 'application/json' }
    );
    
    // 2. Adjuntar partes correctamente
    formData.append('message', messageBlob, 'message.json');
    
    if (file) {
        formData.append('file', file);
    }

    
    return axios.post(
        `${REST_API_BASE_URL}/tickets/${ticketId}/chat/messages`, formData, getHeaders());
};