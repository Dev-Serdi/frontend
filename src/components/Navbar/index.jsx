import React from "react";
import { Navbar } from "react-bootstrap";
import MicrosoftLoginButton from "../MicrosoftAuth/LoginButton";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import NotificationBell from "./NotificationBell";
import { Link } from "react-router-dom";

const Index = ({ toggleSidebar }) => {
  return (
    <>
      <Navbar
        bg="white shadow"
        variant="white"
        className="navbarStyle d-flex flex-wrap justify-content-between align-items-center"
      >
          <Link to="/dashboard" className="w-45 ms-2">
            <img
              src="https://serdiaceros.com.mx/wp-content/uploads/2022/08/SERDI-logo-web-1.png"
              alt=""
              width={"100%"}
            />
          </Link>
        <AuthenticatedTemplate>
          <div className="d-flex align-items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 mr-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only sm:not-sr-only">Abrir</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
          </div>
          <ProfileContent />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <div className="p-3">Por favor, inicia sesión.</div>
        </UnauthenticatedTemplate>
        <MicrosoftLoginButton />
      </Navbar>
    </>
  );
};

const ProfileContent = () => {
  const { accounts } = useMsal();
  const name = accounts[0]?.name;  
  return (
    <div className="d-flex align-items-center">
      {name && <div className="p-3">Bienvenido,{" "}
        <Link to="/perfil" className="font- text-decoration-none">
          <span className="text-blue-700">
            {name}
          </span>
        </Link>
            !
        </div>}
      <NotificationBell />
    </div>
  );
};
export default Index;
