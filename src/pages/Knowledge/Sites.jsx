import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/estilos.css";
import MySitesComponent from "./ComponentsKnow/Sites_Components/MySitesComponent.jsx";
import SitesFinderComponent from "./ComponentsKnow/Sites_Components/SitesFinderComponent.jsx";
import { CreateSitesComponent } from "./ComponentsKnow/Sites_Components/CreateSitesComponent.jsx";
import FavoritesComponent from "./ComponentsKnow/Sites_Components/FavoritesComponent.jsx";
import { getSitiosByUser, createSitio } from "../../services/SitioService";
import { getUserId } from "../../services/UsuarioService.js";
import { useNavigate } from "react-router-dom";

const Sites = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // Obtén el usuario actual del contexto
  const [activeTab, setActiveTab] = useState("misSitios");
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null); // Nuevo estado para el sitio actual

  // Cargar sitios de localStorage al montar
  // Obtener userId UNA SOLA VEZ
  useEffect(() => {
    getUserId().then((response) => {
      setUserId(response.data);
    });
  }, []);

  // Cuando ya tengas userId, carga sitios del backend
  useEffect(() => {
    if (userId) {
      getSitiosByUser(userId)
        .then((response) => {
          setSites(response.data);
          
        })
        .catch((error) => {
          console.error("Error al obtener los sitios del usuario:", error);
        });
    }
  }, [userId]); // 👈 Reaccionamos al cambio en userId

  useEffect(() => {
    getUserId().then((response) => {
      setUserId(response.data);
    });
  }, []);

  const addSite = (newSite) => {
    createSitio(newSite)
      .then((response) => {
        setSites((prevSites) => [...prevSites, response.data]);
      })
      .catch((error) => {
        console.error("Error al crear el sitio:", error);
      });
  };

  // Función para abrir un sitio
  const openSite = (site) => {    
    setCurrentSite(site);
  };

  const renderComponent = () => {
    switch (activeTab) {
      case "misSitios":
        return (
          <MySitesComponent
            sites={sites}
            setSites={setSites}
            onSiteClick={openSite}
            userId={userId}
          />
        );
      case "buscarSitios":
        return <SitesFinderComponent />;
      case "crearSitio":
        return <CreateSitesComponent addSite={addSite} usuarioId={userId} />;
      case "favoritos":
        return (
          <FavoritesComponent
            sites={sites}
            setSites={setSites}
            onSiteClick={openSite}
          />
        );
      default:
        return null;
    }
  };

  // Si hay un sitio seleccionado, mostramos la vista detallada
  if (currentSite) {
    return navigate(`/knowledge/sites/${currentSite?.id}`);
  }

  // Vista normal de pestañas
  return (
    <div className="container mt-4 sites-tabs lg shadow-lg p-4 bg-white rounded">
      {/* Botones de pestaña */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <button
          className={`btn tab-button ${
            activeTab === "misSitios" ? "active" : ""
          }`}
          onClick={() => setActiveTab("misSitios")}
        >
          Mis sitios
        </button>
        <button
          className={`btn tab-button ${
            activeTab === "buscarSitios" ? "active" : ""
          }`}
          onClick={() => setActiveTab("buscarSitios")}
        >
          Buscar sitios
        </button>
        <CreateSitesComponent onClick={true} addSite={addSite} />
        <button
          className={`btn tab-button ${
            activeTab === "favoritos" ? "active" : ""
          }`}
          onClick={() => setActiveTab("favoritos")}
        >
          Favoritos
        </button>
      </div>

      {/* Render del contenido dinámico */}
      <div className="components-container">{renderComponent()}</div>
    </div>
  );
};

export default Sites;
