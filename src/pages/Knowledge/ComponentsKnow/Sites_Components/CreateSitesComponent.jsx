import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { getUserId, listUsers } from "../../../../services/UsuarioService";

export const CreateSitesComponent = ({ addSite, onClick }) => {
  const [showModal, setShowModal] = useState(false);
  const [siteData, setSiteData] = useState({
    type: "Collaboration Site",
    name: "",
    siteId: "",
    visibility: "Public",
    description: "",
  });
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    listUsers(null, 0, 1000, "", 2) // Modulo 2 = Knowledge/Gestion documental
      .then((res) => setUsuarios(res.data.content) )
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSiteData({
      ...siteData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const creadorId = await getUserId().then((res) => res.data);

    const nuevoSitio = {
      ...siteData,
      creadorId,
      usuariosAsignados: usuarios
        .filter((u) => siteData.usuariosAsignados?.includes(u.id))
        .map((u) => ({ id: u.id })),
    };

    addSite(nuevoSitio);
    handleClose();
    window.location.reload();
    // limpiar
  };

  return (
    <>
      {/* No necesitamos botón aquí si abres modal desde arriba */}
      {/* Pero si quieres mantener botón dentro del componente, mantenlo */}
      <button
        type="button"
        className={`btn tab-button ${showModal ? "active" : ""}`}
        onClick={() => setShowModal(onClick)}
      >
        <i className="bi bi-plus-circle-fill me-2"></i>
        Crear Sitio
      </button>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-globe me-2"></i>
            Crear Nuevo Sitio
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Container>
              <Row className="mb-1">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="bi bi-tag-fill me-2"></i>
                      Tipo de Sitio
                    </Form.Label>
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue="Sitio de Colaboración"
                      className="form-control-plaintext ps-4"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="bi bi-card-heading me-2"></i>
                      Nombre del Sitio <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={siteData.name}
                      onChange={handleInputChange}
                      required
                      className="border-primary"
                      placeholder="Ingrese el nombre del sitio"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="bi bi-hash me-2"></i>
                      ID del Sitio <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="siteId"
                      value={siteData.siteId}
                      onChange={handleInputChange}
                      pattern="[a-zA-Z0-9]+"
                      title="Use solo números y letras"
                      required
                      className="border-primary"
                      placeholder="Ej: miSitio2023"
                    />
                    <Form.Text className="text-muted ms-4">
                      <i className="bi bi-info-circle me-1"></i>
                      Parte de la dirección del sitio (solo números y letras)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4 border-primary" />

              <Row className="mb-4">
                <Col>
                  <h5 className="fw-bold text-primary">
                    <i className="bi bi-text-paragraph me-2"></i>
                    Descripción
                  </h5>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={siteData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="border-primary"
                      placeholder="Describa el propósito de este sitio..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Añade selector de usuarios aquí */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold text-primary">
                  Asignar Usuarios al Sitio
                </Form.Label>
                <div
                  style={{
                    border: "1px solid #ced4da",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <Form.Select
                    multiple
                    size="6"
                    value={siteData.usuariosAsignados || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (option) => parseInt(option.value)
                      );
                      setSiteData({ ...siteData, usuariosAsignados: selected });
                    }}
                    style={{ border: "none", backgroundColor: "transparent" }}
                  >
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        👤 {usuario.nombre} {usuario.apellido} — {usuario.email}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="mt-2">
                  {usuarios
                    .filter((u) =>
                      (siteData.usuariosAsignados || []).includes(u.id)
                    )
                    .map((u) => (
                      <span key={u.id} className="badge bg-primary me-1 mb-1">
                        {u.nombre} {u.apellido}
                      </span>
                    ))}
                  Mantén Ctrl/Cmd para seleccionar múltiples usuarios.
                </div>
              </Form.Group>
            </Container>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={handleClose}>
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-check-circle me-2"></i>
              Crear Sitios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CreateSitesComponent;
