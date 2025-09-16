import React from "react";
export const ErrorComponent = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-5 max-w-md w-full text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="#fee2e2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Error de conexión!
        </h2>
        <p className="text-gray-600 mb-6">
          No se pudo conectar con la base de datos.
          <br />
          Por favor, verifica tu conexión o intenta nuevamente más tarde.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition-colors"
        >
          Reintentar.
        </button>
      </div>
    </div>
  );
};
