import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaStar, FaRegStar, FaExternalLinkAlt } from 'react-icons/fa';
import { getSitios, deleteSitio, updateSitio } from '../../../../services/SitioService';
import { getSitiosByUser } from '../../../../services/SitioService';
import { getUserId } from '../../../../services/UsuarioService';



const MySitesComponent = ({ onSiteClick}) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar sitios al montar el componente o cuando cambie el userId
useEffect(() => {
  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const userIdResponse = await getUserId();
      const userId = userIdResponse.data;
      const response = await getSitiosByUser(userId);
      setSites(response.data);
    } catch (err) {
      console.error("Error al cargar sitios:", err);
      setError("Error al cargar los sitios. Verifica tu sesión.");
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem("authToken");

  if (token) {
    fetchSites();
  } else {
    console.warn("Token no disponible aún.");
  }
}, []);

const toggleFavorite = async (siteId) => {
  try {
    const siteToUpdate = sites.find(s => s.id === siteId);

    if (!siteToUpdate) {
      console.warn("Sitio no encontrado en el estado.");
      return;
    }

    const nuevoEstado = !siteToUpdate.favorito;

    // Actualización optimista en frontend
    const updatedSites = sites.map(site =>
      site.id === siteId ? { ...site, favorito: nuevoEstado } : site
    );
    setSites(updatedSites);

    // Payload completo para evitar errores 500
    const fullPayload = {
      name: siteToUpdate.nombre || siteToUpdate.name,
      description: siteToUpdate.descripcion || siteToUpdate.description || '',
      type: siteToUpdate.tipo || siteToUpdate.type || 'Collaboration Site',
      visibility: siteToUpdate.visibilidad || siteToUpdate.visibility || 'Public',
      siteId: siteToUpdate.slug || siteToUpdate.siteId,
      favorito: nuevoEstado
    };

    await updateSitio(siteId, fullPayload);
  } catch (err) {
    console.error("Error al actualizar favorito:", err);
    alert("No se pudo actualizar el favorito. Verifica tu conexión o sesión.");
  }
};



  const handleDeleteSite = async (siteId) => {
    if(window.confirm('¿Seguro que deseas eliminar este sitio?')) {
      try {
        await deleteSitio(siteId);
        setSites(prevSites => prevSites.filter(site => site.id !== siteId));
      } catch (err) {
        console.error("Error al eliminar sitio:", err);
        setError("Error al eliminar el sitio");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p>Cargando sitios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

return (
  <>
    {sites.length === 0 ? (
      <p className="mt-3">No tienes sitios creados.</p>
    ) : (
      <div className="mt-4">
        <div className="row g-3">
          {sites.map(site => (
            <div className="col-12 col-md-6 col-lg-4" key={site.id}>
              <div
                className={`card h-100 border-0 shadow-sm ${
                  site.favorito ? 'border-start border-5 border-warning' : 'border-start border-5 border-secondary'
                }`}
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSiteClick(site)}
                  >
                    <h5 className="card-title text-dark fw-bold mb-1">
                      {site.name}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      ID: {site.siteId}
                    </h6>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                      variant={site.favorito ? 'warning' : 'outline-warning'}
                      size="sm"
                      title={site.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      onClick={() => toggleFavorite(site.id)}
                    >
                      {site.favorito ? <FaStar /> : <FaRegStar />}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      title="Abrir sitio"
                      onClick={() => onSiteClick(site)}
                    >
                      <FaExternalLinkAlt />
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      title="Eliminar sitio"
                      onClick={() => handleDeleteSite(site.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

};

export default MySitesComponent;