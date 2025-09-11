import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import App from "./App.jsx";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./services/authConfig.js";
import { MsalProvider } from "@azure/msal-react";
// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById("root")).render(
  <MsalProvider instance={msalInstance}>
      <App />
  </MsalProvider>
);
