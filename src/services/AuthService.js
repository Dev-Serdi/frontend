export const getAuthToken = () => {
    try {
        const tokenString = localStorage.getItem('authToken'); // O la clave que uses
        const tokenData = JSON.parse(tokenString);
        return tokenData?.accessToken || null;        
    } catch (error) {
        console.error("Error al obtener token de localStorage:", error);
        return null;
    }
};
