import React, { useCallback, useEffect, useState, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  signUp,
  getUserById,
  updateUser,
  listAllModulos,
  listAllPermisos,
} from "../../services/UsuarioService";
import { listAllDepartamentos } from "../../services/DepartamentoService";
import { listRol } from "../../services/RolService";
import { listAllUbicaciones } from "../../services/UbicacionService";
import { formatUserModulo, formatUserRoleWithSystem } from "../../utils/utils";
import { Transition } from "@headlessui/react";

const FormInput = memo(({ label, name, value, onChange, error, ...props }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-3 py-2 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));

const FormSelect = memo(
  ({ label, name, value, onChange, error, options, placeholder }) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);

const UsersComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rolId: "",
    departamentoId: "",
    ubicacion: "", 
    moduloId: "",
    permisos: [],
    enabled: true,
  });

  const [options, setOptions] = useState({
    departamentos: [],
    ubicaciones: [], 
    roles: [],
    modulos: [],
    permisos: [],
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const esModuloGestion = options.modulos.some(
    (mod) =>
      mod.id === parseInt(formData.moduloId) &&
      mod.nombre.toUpperCase() === "GESTION"
  );

  const loadInitialData = useCallback(async () => {
    try {
      const [depRes, rolRes, modRes, prmRes, ubiRes] = await Promise.all([
        listAllDepartamentos(),
        listRol(),
        listAllModulos(),
        listAllPermisos(),
        listAllUbicaciones(), 
      ]);
      setOptions({
        departamentos: depRes.data || [],
        roles: rolRes.data || [],
        modulos: modRes.data || [],
        permisos: prmRes.data || [],
        ubicaciones: ubiRes.data || [],
      });
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  }, []);

  // --- Carga de datos del usuario existente ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (id) {
        try {
          const { data: user } = await getUserById(id);
          setFormData({
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            rolId: user.rol.id || "",
            departamentoId: user.departamento?.id || "",
            ubicacion: user.ubicacion || "", 
            moduloId: user.modulo?.id || "",
            permisos: user.permisos || [],
            enabled: user.enabled,
          });
        } catch (error) {
          console.error(error);
          
        }
      }
      setLoading(false);
    };

    loadInitialData().then(fetchUserData);
  }, [id, loadInitialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permisoNombre) => {
    setFormData((prev) => {
      const newPermisos = prev.permisos.includes(permisoNombre)
        ? prev.permisos.filter((p) => p !== permisoNombre)
        : [...prev.permisos, permisoNombre];
      return { ...prev, permisos: newPermisos };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellido.trim())
      newErrors.apellido = "El apellido es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El formato del email no es válido";
    if (!formData.rolId) newErrors.rol = "El rol es obligatorio";
    if (!formData.moduloId) newErrors.moduloId = "El módulo es obligatorio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveOrUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const userData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      enabled: formData.enabled,
      rol: formData.rolId ? { id: parseInt(formData.rolId) } : null, // <-- Corrección aquí
      permisos: formData.permisos,
      departamento: formData.departamentoId ? {id : parseInt(formData.departamentoId)} : null,
      ubicacion: formData.ubicacion,
      modulo: formData.moduloId ? { id: parseInt(formData.moduloId) } : null,
    };
    try {
      if (id) {
        await updateUser(id, userData);
      } else {
        await signUp(userData);
      }
      navigate("/admin/usuarios/todos");
    } catch (error) {
      console.error(error || "Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const permisosFiltrados = options.permisos.filter(
    (p) => String(p.moduloId) === String(formData.moduloId)
  );
  if (loading && !id) setLoading(false); // Deja de cargar si es un usuario nuevo
  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Transition
        show={true}
        as="div"
        appear
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        <form
          onSubmit={saveOrUpdateUser}
          noValidate
          className="bg-white p-4 rounded-2xl shadow-lg space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            {id ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h2>

          {/* --- Sección de Información Personal --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              required
              placeholder="John"
            />
            <FormInput
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              error={errors.apellido}
              required
              placeholder="Doe"
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="john.doe@example.com"
            />
            {/* Switch de activado/desactivado */}
            <div className="flex flex-col justify-center items-start mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado actual</label>
              <button
                type="button"
                className={`flex items-center px-4 py-2 rounded-full focus:outline-none transition-colors ${formData.enabled ? "bg-green-100" : "bg-red-100"}`}
                onClick={() => setFormData((prev) => ({ ...prev, enabled: !prev.enabled }))}
                aria-pressed={formData.enabled}
              >
                <span className={`w-3 h-3 rounded-full m-1 ${formData.enabled ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className={`font-semibold text-sm ${formData.enabled ? "text-green-700" : "text-red-700"}`}>
                  {formData.enabled ? "Activado" : "Desactivado"}
                </span>
              </button>
              <span className="text-xs text-gray-500 mt-1">Haz clic para cambiar el estado del usuario.</span>
            </div>
          </div>

          {/* --- Sección de Asignación y Roles --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Rol"
              name="rolId"
              value={formData.rolId}
              onChange={handleChange}
              error={errors.rolId}
              placeholder="Seleccione un rol"
              options={options.roles.map((r) => ({
                value: r.id,
                label: formatUserRoleWithSystem(r.nombre),
              }))}
            />
            <FormSelect
              label="Módulo Principal"
              name="moduloId"
              value={formData.moduloId}
              onChange={handleChange}
              error={errors.moduloId}
              placeholder="Seleccione un módulo"
              options={options.modulos.map((m) => ({
                value: m.id,
                label: formatUserModulo(m.nombre),
              }))}
            />
            {!esModuloGestion && (
              <FormSelect
                label="Departamento"
                name="departamentoId"
                value={formData.departamentoId}
                onChange={handleChange}
                placeholder="Seleccione un departamento"
                options={options.departamentos.map((d) => ({
                  value: d.id,
                  label: d.nombre,
                }))}
              />
            )}
            <FormSelect
              label="Ubicación"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Seleccione una ubicación"
              options={options.ubicaciones.map((s) => ({
                value: s.nombre,
                label: s.nombre,
              }))}
            />
          </div>

          {/* --- Sección de Permisos (Condicional) --- */}
          {!esModuloGestion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos Específicos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                {permisosFiltrados.length > 0 ? (
                  permisosFiltrados.map((p) => (
                    <label
                      key={p.nombre}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permisos.includes(p.nombre)}
                        onChange={() => handlePermissionChange(p.nombre)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 m-2"
                      />
                      <span className="text-sm m-1 text-gray-700">
                        {p.nombre
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/^./, (c) => c.toUpperCase())}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 col-span-full">
                    No hay permisos para este módulo.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --- Botones de Acción --- */}
          <div className="flex justify-end gap-4 pt-4 border-">
            <button
              type="button"
              onClick={() => navigate("/admin/usuarios/todos")}
              className="px-6 py-2 p-1 rounded bg-gray-100 text-gray-700  hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white p-1 hover:bg-indigo-700 transition-colors disabled:opacity-50 rounded"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Transition>
    </div>
  );
};
FormInput.displayName = "FormInput';";
FormSelect.displayName = "FormSelect";
export default UsersComponent;
