import React, { useEffect, useState } from "react";
import "../../styles/estilos.css";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../../services/UsuarioService";
import { getSitiosByUser } from "../../services/SitioService";
import { getAllActivities } from "../../services/ActivityService";
import { getCarpetasByUsuario } from "../../services/MisArchivosService";

const Home = () => {
  const [misSitios, setMisSitios] = useState([]);
  const [misTareas, setMisTareas] = useState([]);
  const [misWorkflows, setMisWorkflows] = useState([]);
  const [misCarpetas, setMisCarpetas] = useState([]);
  const [filtroSitios, setFiltroSitios] = useState("all");
  console.log(misSitios);
  

  const navigate = useNavigate();

  // Cargar datos del usuario
  useEffect(() => {
    getUserId().then((res) => {
      const id = res.data;

      // Obtener carpetas del usuario
      getCarpetasByUsuario(id)
        .then((res) => setMisCarpetas(res.data))
        .catch((err) => console.error("Error al obtener carpetas:", err));

      // Obtener sitios del usuario
      getSitiosByUser(id)
        .then((res) => setMisSitios(res.data))
        .catch((err) => console.error("Error al obtener sitios:", err));        

      // Obtener actividades y filtrar por tipo
      getAllActivities()
        .then((res) => {
          const actividades = res.data;
          const tareas = actividades.filter(
            (a) =>
              a.type === "task" &&
              a.usuariosAsignados?.includes(id) &&
              a.status !== true
          );
          const workflows = actividades.filter(
            (a) =>
              a.type === "workflow" &&
              a.usuariosAsignados?.includes(id) &&
              a.status !== true
          );
          setMisTareas(tareas);
          setMisWorkflows(workflows);
        })
        .catch((err) => console.error("Error al obtener actividades:", err));
    });
  }, []);

  // Aplicar filtro a sitios
  const sitiosFiltrados = misSitios
    .filter((sitio) => (filtroSitios === "favorites" ? sitio.favorito : true))
    .sort((a, b) => {
      if (filtroSitios === "recent") {
        return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
      }
      return 0;
    });

  // Manejar cambio de filtros (puedes expandir esto si agregas más filtros)
  const handleFilterChange = (filterName, value) => {
    if (filterName === "Sites") {
      setFiltroSitios(value);
    }
  };

  return (
    <div className="home-container">
      <h1>Inicio</h1>

      <div className="grid-layout">
        {/* 🔷 Sección: Mis Sitios */}
        <div className="grid-item">
          <h2>Mis Sitios</h2>
          <div className="filter-container">
            <select
              className="filter small-filter"
              onChange={(e) => handleFilterChange("Sites", e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="favorites">Mis Favoritos</option>
              <option value="recent">Recientes</option>
            </select>
          </div>

          <div className="mt-3">
            {sitiosFiltrados.length === 0 ? (
              <p className="text-muted">No hay sitios para mostrar.</p>
            ) : (
              <ul className="list-unstyled">
                {sitiosFiltrados.map((sitio) => (
                  <li
                    key={sitio.id}
                    className="mb-2 p-2 border rounded bg-light"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/knowledge/sites/${sitio.id}`)
                    }
                  >
                    <strong>{sitio.name}</strong>
                    <br />
                    <small className="text-muted">ID: {sitio.siteId}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 🔷 Sección: Mis Actividades */}
        <div className="grid-item">
          <h2>Mis Actividades</h2>
          <div className="filter-container activities-filters">
            {/* Filtros múltiples (sin lógica aplicada aún) */}
            <select className="filter small-filter">
              <option value="all">Todos los elementos</option>
            </select>
          </div>

          <ul className="list-unstyled mt-3">
            {misWorkflows.length === 0 ? (
              <p className="text-muted">
                No tienes flujos de trabajo asignados.
              </p>
            ) : (
              misWorkflows.map((wf) => (
                <li key={wf.id} className="mb-2 border rounded p-2 bg-light">
                  <strong>{wf.name}</strong>
                  <br />
                  <small className="text-muted">
                    Aprobación requerida: {wf.approvalPercentage}%
                  </small>
                  <br />
                  <span>{wf.description}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 🔷 Sección: Mis Tareas */}
        <div className="grid-item">
          <h2>Mis Tareas</h2>
          <div className="filter-container">
            <select className="filter small-filter">
              <option value="Active">Tareas Activas</option>
            </select>
          </div>

          <ul className="list-unstyled mt-3">
            {misTareas.length === 0 ? (
              <p className="text-muted">No tienes tareas asignadas.</p>
            ) : (
              misTareas.map((tarea) => (
                <li key={tarea.id} className="mb-2 border rounded p-2 bg-light">
                  <strong>{tarea.name}</strong>
                  <br />
                  <small className="text-muted">
                    Prioridad: {tarea.priority}
                  </small>
                  <br />
                  <span>{tarea.description}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 🔷 Sección: Mis Documentos */}
        <div className="grid-item">
          <h2>Mis Documentos</h2>
          <div className="filter-container">
            <select className="filter small-filter">
              <option value="recently-modified">Todos los elementos</option>
            </select>
          </div>

          <div className="mt-3">
            {misCarpetas.length === 0 ? (
              <p className="text-muted">No tienes carpetas creadas.</p>
            ) : (
              <ul className="list-unstyled">
                {misCarpetas.map((carpeta) => (
                  <li
                    key={carpeta.id}
                    className="mb-2 p-2 border rounded bg-light"
                  >
                    <strong>{carpeta.nombre}</strong>
                    <br />
                    <small className="text-muted">
                      Creada el{" "}
                      {new Date(carpeta.fechaCreacion).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
