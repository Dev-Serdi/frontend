import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-md space-y-4">
        <FaExclamationTriangle className="w-30 h-30 mx-auto text-red-500" />
        <h1 className="glitch text-4xl font-bold text-gray-800">
          Página no encontrada.
        </h1>
        <p className="text-gray-600">
          La página que estás buscando no existe o no cuentas con permisos suficientes.
        </p>
        <Link
          to="/dashboard"
          className="text-decoration-none p-1 inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
