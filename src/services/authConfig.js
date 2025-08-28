export const msalConfig = {
  auth: {
    clientId: "542b1ade-0aac-497a-9646-fb7f45a577b9",
    authority:
      "https://login.microsoftonline.com/410adee4-b811-40a9-8a94-49b729819135",
    // redirectUri: "http://localhost:3000",
    redirectUri: "https://mds.serdi.com.mx",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    allowNativeBroker: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
