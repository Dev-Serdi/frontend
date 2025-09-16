// src/hooks/useUserRoles.js
import { useState, useEffect } from 'react';
import { getUserRoles } from '../services/UsuarioService'; // Adjust path if needed

/**
 * Custom hook to fetch user roles based on the JWT token in localStorage.
 * @returns {{roles: string[], isLoading: boolean, error: string | null}}
 */
export const useUserRoles = () => {
  const [state, setState] = useState({
    roles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchRoles = async () => {
      try {
        // Start loading
        if (isMounted) {
          // Only set loading true if it wasn't already (avoids flicker on quick refreshes)
          setState(s => s.isLoading ? s : { ...s, isLoading: true, error: null });
        }

        const response = await getUserRoles();
        
        if (isMounted) {
          setState({ roles: response?.data || [], isLoading: false, error: null });
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        if (isMounted) {
          setState({ roles: [], isLoading: false, error: error.message || 'Error al obtener roles.' });
        }
      }
    };
    fetchRoles();
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Dependency array is empty, runs once on mount

  return state;
};
