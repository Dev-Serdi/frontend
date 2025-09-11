import React, { useEffect, useState, useCallback, useId } from "react";
import {
  FiBriefcase,
  FiMail,
  FiShield,
  FiKey,
  FiBell,
  FiLoader,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
// Importamos las nuevas funciones del servicio
import {
  getUserByEmail,
  getMisPreferencias,
  updateMisPreferencias,
} from "../../services/UsuarioService";
import { formatUserRole } from "../../utils/utils";
import { Link } from "react-router-dom";

/**
 * Componente principal que muestra el perfil del usuario y sus preferencias de notificación.
 */
const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [preferencias, setPreferencias] = useState({
    todas: [],
    activas: new Set(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPreferenciasOpen, setIsPreferenciasOpen] = useState(false);
  const preferenciasId = useId();

  const fetchDatosPerfil = useCallback(async () => {
    try {
      setIsLoading(true);
      // Hacemos ambas llamadas a la API en paralelo para mejorar el rendimiento
      const [responseUsuario, responsePreferencias] = await Promise.all([
        getUserByEmail(),
        getMisPreferencias(),
      ]);
      // const prueba = new Set(
      //   responsePreferencias.data.todasLasPreferencias
      //     .filter((p) => p.configurable)
      //     .map((p) => p.tipo)
      // );

      const rol = responseUsuario.data.rol.nombre;
      setUsuario(responseUsuario.data);
      if (rol === "ROLE_ADMIN") {
        setPreferencias({
        todas: responsePreferencias.data.todasLasPreferencias, // Mostramos todas mas las no configurables
        activas: new Set(responsePreferencias.data.preferenciasActivas),
      })
      }else setPreferencias({
        todas: responsePreferencias.data.todasLasPreferencias.filter(
          (p) => p.configurable
        ), // Mostramos solo las configurables
        activas: new Set(responsePreferencias.data.preferenciasActivas),
      });
      setError(null);
    } catch (err) {
      console.error("Error al cargar los datos del perfil:", err);
      setError(
        "No se pudieron cargar los datos del perfil. Inténtalo de nuevo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatosPerfil();
  }, [fetchDatosPerfil]);

  const handleGuardarPreferencias = async (nuevasPreferenciasActivas) => {
    try {
      await updateMisPreferencias(nuevasPreferenciasActivas);
      // Actualizamos el estado local para reflejar los cambios inmediatamente
      setPreferencias((prev) => ({
        ...prev,
        activas: nuevasPreferenciasActivas,
      }));
      // Opcional: mostrar una notificación de éxito al usuario
      alert("Preferencias guardadas con éxito.");
    } catch (err) {
      console.error("Error al guardar las preferencias:", err);
      // Opcional: mostrar una notificación de error
      alert("No se pudieron guardar las preferencias.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <FiLoader className="animate-spin h-8 w-8 mx-auto" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  const userData = {
    id: usuario?.id,
    nombre: usuario?.nombre || "No se encontraron datos.",
    apellido: usuario?.apellido || "No se encontraron datos.",
    email: usuario?.email || "No se encontraron datos.",
    departamento: {
      nombre: usuario?.departamento?.nombre || "No asignado",
    },
    rol: usuario?.rol.nombre || [],
    permisos: usuario?.permisos || [],
    ubicacion: usuario?.ubicacion || "No se encontró ubicación",
  };
  

  return (
    <div className="max-w-lg mx-auto mb- 2 bg-white rounded-xl shadow-lg overflow-hidden my-8 font-sans">
      <div className="p-4 md:p-8">
        {/* Encabezado con Nombre y Email */}
        <div className="flex items-center p-1 border-b border-gray-200">
          <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-semibold">
            {userData.nombre.charAt(0)}
            {userData.apellido.charAt(0)}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-800">
              <Link
                to={`/perfil/${userData.id}`}
                className="text-decoration-none"
              >
                {userData.nombre} {userData.apellido}
              </Link>
            </h1>
            <a
              href={`mailto:${userData.email}`}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FiMail className="h-4 w-4 mr-1" />
              {userData.email}
            </a>
            <span className="text-sm text-gray-500">{userData.ubicacion}</span>
          </div>
        </div>

        <InfoSection
          title="Departamento"
          icon={<FiBriefcase className="text-indigo-500" />}
        >
          <Pill text={userData.departamento.nombre} color="indigo" />
        </InfoSection>

        <InfoSection
          title="Rol"
          icon={<FiShield className="text-green-500" />}
        >
              <Pill
                text={userData.rol ? formatUserRole(userData.rol) : "Sin rol asignado"} color="green"
              />
        </InfoSection>

        <InfoSection
          title="Permisos"
          icon={<FiKey className="text-yellow-500" />}
        >
          {userData.permisos.length > 0 ? (
            userData.permisos.map((permiso, index) => (
              <Pill
                key={`permiso-${index}`}
                text={permiso
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())}
                color="yellow"
              />
            ))
          ) : (
            <InfoItem value="Sin permisos asignados" isPlaceholder />
          )}
        </InfoSection>

        {/* --- NUEVA SECCIÓN DE PREFERENCIAS DE NOTIFICACIÓN --- */}
        <div className="my-4">
          <button
            onClick={() => setIsPreferenciasOpen(!isPreferenciasOpen)}
            className="w-full flex justify-between items-center text-left rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
            aria-expanded={isPreferenciasOpen}
            aria-controls={preferenciasId}
          >
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FiBell className="text-purple-500" />
              Preferencias de Correo
            </h2>
            {isPreferenciasOpen ? (
              <FiChevronUp className=" text-gray-500" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {isPreferenciasOpen && (
            <div id={preferenciasId} className="mt-1 pl-2">
              <PreferenciasNotificaciones
                todasLasPreferencias={preferencias.todas}
                preferenciasActivasIniciales={preferencias.activas}
                onGuardar={handleGuardarPreferencias}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @component PreferenciasNotificaciones
 * @description Gestiona la visualización y actualización de las preferencias de notificación del usuario.
 */
const PreferenciasNotificaciones = ({
  todasLasPreferencias,
  preferenciasActivasIniciales,
  onGuardar,
}) => {
  const [activas, setActivas] = useState(preferenciasActivasIniciales);
  const [isSaving, setIsSaving] = useState(false);

  const handleCheckboxChange = (tipoPreferencia) => {
    setActivas((prevActivas) => {
      const nuevasActivas = new Set(prevActivas);
      if (nuevasActivas.has(tipoPreferencia)) {
        nuevasActivas.delete(tipoPreferencia);
      } else {
        nuevasActivas.add(tipoPreferencia);
      }
      return nuevasActivas;
    });
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onGuardar(activas);
    setIsSaving(false);
  };

  if (todasLasPreferencias.length === 0) {
    return (
      <InfoItem
        value="No hay notificaciones configurables disponibles."
        isPlaceholder
      />
    );
  }

  return (
    <div className="w-fit">
      <div className="space-y-5">
        {todasLasPreferencias.map((pref) => (
          <label
            key={pref.tipo}
            className="w-36 h-20 flex items-start align-text-bottom p-2 m-1 bg-indigo-100 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <input
              type="checkbox"
              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={activas.has(pref.tipo)}
              onChange={() => handleCheckboxChange(pref.tipo)}
            />
            <div className=" text-sm">
              <p className="font-medium text-gray-800">{pref.titulo}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-1 text-right">
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSaving ? <FiLoader className="animate-spin h-5 w-5 mr-2" /> : null}
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
};

// --- Componentes auxiliares sin cambios ---

const InfoSection = ({ title, icon, children }) => (
  <div className="my-8">
    <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
      {React.cloneElement(icon, {
        className: `${icon.props.className || ""} mr-2 h-5 w-5`,
      })}
      {title}
    </h2>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const InfoItem = ({ value, isPlaceholder = false }) => (
  <p
    className={`text-sm ${
      isPlaceholder ? "text-gray-400 italic" : "text-gray-600"
    }`}
  >
    {value}
  </p>
);

const Pill = ({ text, color = "gray" }) => {
  const colorClasses = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        colorClasses[color] || "bg-gray-100 text-gray-700"
      }`}
    >
      {text}
    </span>
  );
};

export default Perfil;
