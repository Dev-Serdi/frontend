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
      {isLoading && <LoadingSpinner fullScreen />}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);