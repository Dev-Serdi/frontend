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

export const UseLoginHandler = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleLogin = async () => {
    // 1. Autenticación con Microsoft
    const response = await instance.loginPopup(loginRequest);
    const graphResponse = await callMsGraph(response.accessToken);

    // 2. Preparar datos para el backend
    const loginData = {
      email: graphResponse.userPrincipalName,
      password: graphResponse.id,
    };
    
    // 3. Login en tu backend
    try {
      const respuesta = await login(loginData);
      localStorage.setItem("authToken", JSON.stringify(respuesta.data));
      const roles = await getUserRoles();
      // 4. Postear Ip en backend
      const ipResponse = await fetch("https://api.ipify.org/?format=json");
      const data = await ipResponse.json();
      // 5. Manejar éxito

      const userRoles = roles.data || [];

      postIp(data);
      if (
        userRoles.includes("ROLE_ADMIN") ||
        userRoles.includes("ROLE_AGENT")
      ) {
        navigate("/helpdesk/tasks");
      } else if (userRoles.includes("ROLE_USER")) {
        navigate("/knowledge/home");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error al iniciar sesion: ", error);
      sessionStorage.clear();
    } finally {
      window.location.reload();
    }
  };

  return { handleLogin };
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
