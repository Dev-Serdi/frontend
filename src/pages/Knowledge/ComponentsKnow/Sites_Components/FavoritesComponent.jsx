import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { FaTrash, FaStar } from 'react-icons/fa';
import { updateSitio } from '../../../../services/SitioService';

const FavoritesComponent = ({ sites, setSites }) => {

const favoriteSites = sites.filter(site => site.favorito);


const removeFavorite = (siteId) => {
  const updatedSites = sites.map(site =>
    site.id === siteId ? { ...site, favorito: false } : site
  );
  setSites(updatedSites);

  updateSitio(siteId, { favorito: false })
    .catch(error => {
      console.error("Error al quitar favorito:", error);
    });
};


  const deleteSite = (siteId) => {
    if(window.confirm('¿Seguro que deseas eliminar este sitio?')) {
      const updatedSites = sites.filter(site => site.siteId !== siteId);
      setSites(updatedSites);
    }
  };

  return (
    <>
      {favoriteSites.length === 0 ? (
        <p>No tienes sitios favoritos.</p>
      ) : (
        <ListGroup>
          {favoriteSites.map(site => (
            <ListGroup.Item
              key={site.siteId}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{site.nombre}</strong>
                <small className="text-muted">ID: {site.siteId}</small>
              </div>
              <div>
                <Button
                  variant="link"
                  title="Quitar de favoritos"
                  onClick={() => removeFavorite(site.siteId)}
                >
                  <FaStar color="#ffc107" />
                </Button>
                <Button
                  variant="link"
                  title="Eliminar sitio"
                  onClick={() => deleteSite(site.siteId)}
                >
                  <FaTrash color="#dc3545" />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  );
};

export default FavoritesComponent;
