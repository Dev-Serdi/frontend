import React, { useEffect, useState } from "react";
import {
  getSitiosEliminados,
  restaurarSitio
} from "../../services/SitioService";
import {
  getDeletedActivities,
  restoreActivity
} from "../../services/ActivityService";
import {
  getArchivosEliminados,
  getCarpetasEliminadas,
  restaurarArchivo,
  restaurarCarpeta,
  getUserId,
  getArchivoUrl
} from "../../services/MisArchivosService";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Spinner
} from "react-bootstrap";

const Eliminados = () => {
  const [sitios, setSitios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [carpetas, setCarpetas] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getUserId();
        setUsuarioId(res.data);
      } catch (err) {
        console.error("Error al obtener ID de usuario:", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (usuarioId) {
      fetchData();
    }
  }, [usuarioId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitiosRes, actividadesRes, archivosRes, carpetasRes] =
        await Promise.all([
          getSitiosEliminados(),
          getDeletedActivities(),
          getArchivosEliminados(usuarioId),
          getCarpetasEliminadas(usuarioId)
        ]);

      setSitios(sitiosRes.data);
      setActividades(actividadesRes.data);
      setArchivos(archivosRes.data);
      setCarpetas(carpetasRes.data);
    } catch (error) {
      console.error("Error al cargar datos eliminados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, type) => {
    try {
      switch (type) {
        case "sitio":
          await restaurarSitio(id);
          break;
        case "actividad":
          await restoreActivity(id);
          break;
        case "archivo":
          await restaurarArchivo(id);
          break;
        case "carpeta":
          await restaurarCarpeta(id);
          break;
        default:
          return;
      }
      fetchData();
    } catch (err) {
      console.error(`Error al restaurar ${type}:`, err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando datos eliminados...</p>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header as="h5">🗂️ Sitios Eliminados</Card.Header>
            <ListGroup variant="flush">
              {sitios.length > 0 ? (
                sitios.map((sitio) => (
                  <ListGroup.Item
                    key={sitio.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{sitio.name}</strong>
                      <div className="text-muted small">{sitio.description}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleRestore(sitio.id, "sitio")}
                    >
                      Restaurar
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay sitios eliminados.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header as="h5">📋 Actividades Eliminadas</Card.Header>
            <ListGroup variant="flush">
              {actividades.length > 0 ? (
                actividades.map((act) => (
                  <ListGroup.Item
                    key={act.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <strong>{act.name}</strong>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleRestore(act.id, "actividad")}
                    >
                      Restaurar
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay actividades eliminadas.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header as="h5">📁 Carpetas Eliminadas</Card.Header>
            <ListGroup variant="flush">
              {carpetas.length > 0 ? (
                carpetas.map((c) => (
                  <ListGroup.Item
                    key={c.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <strong>{c.nombre}</strong>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleRestore(c.id, "carpeta")}
                    >
                      Restaurar
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay carpetas eliminadas.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header as="h5">📄 Archivos Eliminados</Card.Header>
            <ListGroup variant="flush">
              {archivos.length > 0 ? (
                archivos.map((a) => (
                  <ListGroup.Item
                    key={a.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{a.nombre}</strong>{" "}
                      <span className="text-muted small">
                        ({(a.tamaño / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <a
                        href={getArchivoUrl(a.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Ver
                      </a>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleRestore(a.id, "archivo")}
                      >
                        Restaurar
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay archivos eliminados.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Eliminados;
