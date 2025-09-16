import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../services/authConfig";
import { callMsGraph } from "../../graph";
import { signUp, login, updateMisPreferencias } from "../../services/UsuarioService";
import { useAuth } from "../AuthContext";

export const MicrosoftSignUp = () => {
  const { instance } = useMsal();
  const { login: authLogin, setIsLoading, isLoading } = useAuth(); // <-- Agrega isLoading
  const navigate = useNavigate();
  
  const handleSignUp = async () => {
    const preferencias = new Set([
        "NUEVO_MENSAJE_EN_TICKET",
        "NUEVO_TICKET_ASIGNADO",
        "CAMBIO_ESTADO_TICKET",
        "TICKET_MODIFICADO",
        "REASIGNACION_USUARIO_TICKET",
        "REASIGNACION_DEPARTAMENTO_TICKET",
        "TICKET_NO_AUTORIZADO",
        "PERFIL_MODIFICADO",
        "NUEVO_TICKET_CREADO",
        "FECHA_COMPROMISO_ASIGNADA",
      ]);
    setIsLoading(true);
    localStorage.removeItem("authToken");

    try {
      // 1. Autenticación con Microsoft
      const response = await instance.loginPopup(loginRequest);
      if (!response?.accessToken)
        throw new Error("No se pudo obtener el token de acceso");

      // 2. Obtener datos del usuario
      const graphResponse = await callMsGraph(response.accessToken);
      if (!graphResponse?.userPrincipalName)
        throw new Error("Datos de usuario incompletos");
      // 3. Crear usuario en el backend
      const userData = {
        nombre: graphResponse.givenName || "Usuario",
        apellido: graphResponse.surname || "Microsoft",
        email: graphResponse.userPrincipalName,
        password: graphResponse.id,
        ubicacion: graphResponse.officeLocation || "No especificado",
        enabled: true,
      };
      await signUp(userData);

      // 4. Si el registro es exitoso, hacer login
      const loginData = { email: userData.email, password: userData.password };
      const { data: token } = await login(loginData);

      authLogin({ token, user: graphResponse }); // Actualiza el contexto global
    }
    catch (error) {
      setIsLoading(false);
      const errorMessage =
      error.response?.data?.error || error.message || "Error desconocido";
      sessionStorage.clear();
      console.error("Error en el registro:", error);
    } 
    finally {
      setIsLoading(false);
      navigate("/dashboard");
      window.location.reload();
    }
  };
  return { handleSignUp, isLoading};

  // return (
  //   <Transition
  //     appear
  //     show
  //     enter="transition-opacity duration-1000"
  //     enterFrom="opacity-0"
  //     enterTo="opacity-100"
  //   >
  //     <div className="h-60 w-full flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
  //       <div className="mt-8 bg-gray-50 sm:rounded-lg sm:w-full sm:max-w-md">
  //         <div className="pt-4 pb-4 py-8 px-4 shadow sm:rounded-lg sm:px-10">
  //           <div className="space-y-6 ">
  //             {error && (
  //               <div className="text-red-600 text-sm text-center">{error}</div>
  //             )}
  //             <div>
  //               <div className="sm:mx-auto sm:w-full sm:max-w-md">
  //                 <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
  //                   Registrarse con Microsoft
  //                 </h2>
  //               </div>
  //               <button
  //                 onClick={handleSignIn}
  //                 disabled={isLoading}
  //                 className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-[#2F2F2F] text-white hover:bg-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9E] disabled:opacity-50 transition-colors duration-200"
  //               >
  //                 {isLoading ? (
  //                   <svg
  //                     className="animate-spin h-5 w-5 mr-3"
  //                     viewBox="0 0 24 24"
  //                   >
  //                     <circle
  //                       className="opacity-25"
  //                       cx="12"
  //                       cy="12"
  //                       r="10"
  //                       stroke="currentColor"
  //                       strokeWidth="4"
  //                       fill="none"
  //                     />
  //                     <path
  //                       className="opacity-75"
  //                       fill="currentColor"
  //                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //                     />
  //                   </svg>
  //                 ) : (
  //                   <svg
  //                     className="h-5 w-5 mr-2"
  //                     viewBox="0 0 23 23"
  //                     fill="none"
  //                     xmlns="http://www.w3.org/2000/svg"
  //                   >
  //                     {/* ICONO DE MICROSOFT */}
  //                     <path d="M11.5 11.5H22V22H11.5V11.5Z" fill="#F25022" />
  //                     <path d="M11.5 0H22V10.5H11.5V0Z" fill="#7FBA00" />
  //                     <path d="M0 11.5H10.5V22H0V11.5Z" fill="#00A4EF" />
  //                     <path d="M0 0H10.5V10.5H0V0Z" fill="#FFB900" />
  //                   </svg>
  //                 )}
  //                 Registrarse ahora!
  //               </button>
  //             </div>

  //             <div className="text-center text-sm text-gray-600">
  //               Al registrarte, aceptas nuestros{" "}
  //               <a href="#" className="text-[#005A9E] hover:underline">
  //                 términos de servicio
  //               </a>{" "}
  //               y{" "}
  //               <a href="#" className="text-[#005A9E] hover:underline">
  //                 política de privacidad
  //               </a>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </Transition>
  // );
};

