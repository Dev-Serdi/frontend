import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { UseLoginHandler, UseLogoutHandler } from "./ButtonHandler";
import { FaSignInAlt, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import { MicrosoftSignUp } from "./SignupButton";

const MyButton = () => {
  const { isAuthenticated } = useAuth();
  return <div>{isAuthenticated ? <Logout /> : <Login />}</div>;
};

export const Login = () => {
  const { handleLogin } = UseLoginHandler();
  const { handleSignUp } = MicrosoftSignUp();
  const { login: authLogin, setIsLoading, isLoading } = useAuth(); // <-- Agrega isLoading


  return (
    <div className="flex gap-2">
      <Link
        onClick={handleSignUp}
        className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded transition-colors text-decoration-none"
      >
        <FaUserPlus className="mr-1" />
        Crear cuenta
      </Link>
      <button
        onClick={handleLogin}
        className="flex items-center gap-1 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 rounded transition-colors"
      >
        <FaSignInAlt className="mr-1" />
        Acceder
      </button>
    </div>
  );
};

export const Logout = () => {
  const { handleLogout } = UseLogoutHandler();

  return (
    <button
      onClick={handleLogout}
      className="max-w-45 flex items-center gap-1 bg-red-500 px-4 py-2 text-white hover:bg-red-600 rounded transition-colors"
    >
      <FaSignOutAlt className="mr-1" />
      Cerrar sesión
    </button>
  );
};

export default MyButton;