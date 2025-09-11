import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { LoadingSpinner } from '../pages/LoadingSpinner'; // Asume que tienes este componente

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia en true para verificar la sesión existente

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && accounts.length > 0) {
      setIsAuthenticated(true);
      setUser(accounts[0]); // Información básica del usuario de MSAL
    }
    setIsLoading(false); // Finaliza la carga inicial
  }, [accounts]);

  const login = (userData) => {
    localStorage.setItem("authToken", JSON.stringify(userData.token));
    setIsAuthenticated(true);
    setUser(userData.user);
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, setIsLoading }}>
      {isLoading ? (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.7)",
          zIndex: 9999
        }}>
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);