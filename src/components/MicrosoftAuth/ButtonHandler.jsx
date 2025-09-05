import {
  getUserRoles,
  login,
  logout as backendLogout,
} from "../../services/UsuarioService";
import { callMsGraph } from "../../graph";
import { loginRequest } from "../../services/authConfig";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { postIp } from "../../services/IpService";
import { useAuth } from "../AuthContext";

export const UseLoginHandler = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { login: authLogin, setIsLoading, isLoading } = useAuth(); // <-- Agrega isLoading

  const handleLogin = async () => {
    setIsLoading(true);
    
    // 3. Login en tu backend
    try {
      // 1. Autenticación con Microsoft
      const response = await instance.loginPopup(loginRequest);
      const graphResponse = await callMsGraph(response.accessToken);
  
      // 2. Preparar datos para el backend
      const loginData = {
        email: graphResponse.userPrincipalName,
        password: graphResponse.id,
      };
      const respuesta = await login(loginData);
      localStorage.setItem("authToken", JSON.stringify(respuesta.data));
      const roles = await getUserRoles();
      // 4. Postear Ip en backend
      const ipResponse = await fetch("https://api.ipify.org/?format=json");
      const data = await ipResponse.json();
      // 5. Manejar éxito
  authLogin({ token: respuesta.data, user: graphResponse }); // Actualiza el contexto global
      const userRoles = roles.data || [];

      postIp(data);
      if (
      
        userRoles.includes("ROLE_ADMIN") ||
        userRoles.includes("ROLE_AGENT")
      ) {
        console.log("userRoles", userRoles);
        
        navigate("/helpdesk/tasks");
      } else if (userRoles.includes("ROLE_USER")) {
        console.log("userRoles", userRoles);
        
        navigate("/knowledge/home");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error al iniciar sesion: ", error);
      // sessionStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin , isLoading};
};

export const UseLogoutHandler = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Logout en backend
      await backendLogout();
      // Logout en Azure AD
      await instance.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/",
      });
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return { handleLogout };
};
