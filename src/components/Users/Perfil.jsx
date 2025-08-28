import React, { useEffect, useState } from "react";
import { FiBriefcase, FiMail, FiShield, FiKey } from "react-icons/fi";
import { getUserByEmail} from "../../services/UsuarioService";
import { formatUserRole } from "../../utils/utils";
import { Link } from "react-router-dom";

/**
 * @component UserProfileCard
 * @description Muestra la información de perfil de un usuario en un diseño minimalista.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.userData - Datos del usuario a mostrar.
 *   @param {string} props.userData.nombre - Nombre del usuario.
 *   @param {string} props.userData.apellido - Apellido del usuario.
 *   @param {string} props.userData.email - Email del usuario.
 *   @param {object} props.userData.departamento - Departamento del usuario.
 *     @param {string} props.userData.departamento.nombre - Nombre del departamento.
 *   @param {Array<string>} props.userData.roles - Lista de roles del usuario.
 *   @param {Array<string>} props.userData.permisos - Lista de permisos del usuario.
 * @returns {JSX.Element} El componente renderizado.
 */0
const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  useEffect(() => {
    fetchUsuario();
  }, []);

  const fetchUsuario = async () => {
    try {
      const response = await getUserByEmail();
      setUsuario(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const userData = {
    id: usuario?.id,
    nombre: usuario?.nombre || "No se encontraron datos.",
    apellido: usuario?.apellido || "No se encontraron datos.",
    email: usuario?.email || "No se encontraron datos.",
    departamento: {
      id: usuario?.departamento?.id || 0,
      nombre: usuario?.departamento?.nombre || "No se encontraron datos.",
    },
    roles: usuario?.roles || ["Sin roles asignados"],
    permisos: usuario?.permisos || ["Sin permisos asignados"],
    ubicacion: usuario?.ubicacion || "No se encontró ubicación",
  };

  if (!userData) {
    return (
      <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
        <p className="text-gray-500">No se proporcionaron datos del usuario.</p>
      </div>
    );
  }

  const { id, nombre, apellido, email, departamento, roles, permisos, ubicacion } = userData;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 font-sans">
      <div className="p-4 md:p-8">
        {/* Encabezado con Nombre y Email */}
        <div className="flex items-center m-2 p-4 border-b border-gray-200">
          <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-semibold">
              {nombre.charAt(0)}
              {apellido.charAt(0)} 
          </div>
          <div className="m-4">
            <h1 className="text-2xl font-bold text-gray-800">
              <Link to={`/perfil/${id}`} className="text-decoration-none">
                {nombre} {apellido}
              </Link>
            </h1>
            <a
              href={`mailto:${email}`}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FiMail className="h-4 w-4" />
              {email}
            </a>
            <span>{ubicacion}</span>
          </div>
        </div>

        {/* Sección de Departamento */}
        <InfoSection
          title="Departamento"
          icon={<FiBriefcase className="text-indigo-500" />}
        >
          <Pill
            key={"departamento"}
            text={departamento?.nombre || "No asignado"}
            color="indigo"
          />
        </InfoSection>

        {/* Sección de Roles */}
        <InfoSection
          title="Roles"
          icon={<FiShield className="text-green-500" />}
        >
          {roles && roles.length > 0 ? (
            roles.map((rol, index) => (
              <Pill
                key={`rol-${index}`}
                text={formatUserRole(rol)}
                color="green"
              />
            ))
          ) : (
            <InfoItem value="Sin roles asignados" isPlaceholder />
          )}
        </InfoSection>

        {/* Sección de Permisos */}
        <InfoSection
          title="Permisos"
          icon={<FiKey className="text-yellow-500" />}
        >
          {permisos && permisos.length > 0 ? (
            permisos.map((permiso, index) => (
              <Pill
                key={`permiso-${index}`}
                text={permiso.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase())}
                color="yellow"
              />
            ))
          ) : (
            <InfoItem value="Sin permisos asignados" isPlaceholder />
          )}
        </InfoSection>
      </div>
      
    </div>
  );
};

/**
 * @component InfoSection
 * @description Componente auxiliar para renderizar una sección de información.
 */
const InfoSection = ({ title, icon, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
      {React.cloneElement(icon, {
        className: `${icon.props.className || ""} mr-2 h-5 w-5`,
      })}
      {title}
    </h2>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

/**
 * @component InfoItem
 * @description Componente auxiliar para renderizar un item de información simple.
 */
const InfoItem = ({ value, isPlaceholder = false }) => (
  <p
    className={`text-sm ${
      isPlaceholder ? "text-gray-400 italic" : "text-gray-600"
    }`}
  >
    {value}
  </p>
);

/**
 * @component Pill
 * @description Componente auxiliar para renderizar una "píldora" estilizada.
 */
const Pill = ({ text, color = "gray" }) => {
  const colorClasses = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        colorClasses[color] || colorClasses.gray
      }`}
    >
      {text}
    </span>
  );
};

export default Perfil;