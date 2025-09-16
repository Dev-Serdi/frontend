import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Modal,
} from "react-bootstrap";
import {
  FaFilePdf,
  FaArrowLeft,
  FaUserPlus,
  FaUser,
} from "react-icons/fa";
import { getUserId, listUsers } from "../../../../services/UsuarioService"; // Asegúrate que la ruta es correcta
import {
  getUsuariosAsignados,
  agregarUsuariosAsignados,
  getSitioById,
} from "../../../../services/SitioService";
import {
  uploadArchivo,
  getArchivosPorSitio,
  getArchivoUrl,
} from "../../../../services/MisArchivosService";
import { useNavigate, useParams } from "react-router-dom";

const SiteView = () => {
  const siteId = useParams();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [site, setSite] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [usuariosSeleccionadosModal, setUsuariosSeleccionadosModal] = useState(
    []
  );
  const [archivosSitio, setArchivosSitio] = useState([]);
  // Estado para la lista de usuarios cargados del backend
  const [usersState, setUsersState] = useState({
    loading: false,
    error: null,
    users: [],
  });

  // Carga usuarios desde backend cuando se abre el modal
  useEffect(() => {
    if (siteId?.id) {
      getSitioById(siteId.id)
      .then((res) => {
        setSite(res.data)
      })
      getArchivosPorSitio(siteId.id)
        .then((res) => {
          const archivos = res.data.map((a) => ({
            id: a.id,
            name: a.nombre,
            type: "file",
            size: (a.tamaño / 1024).toFixed(2) + " KB",
            date: new Date(a.fechaSubida).toLocaleString(), // Incluye fecha y hora
            url: getArchivoUrl(a.id),
            fileType: a.tipo,
            usuario: a.usuario, // Agrega el objeto completo
          }));

          setArchivosSitio(archivos.reverse()); // ✔️ guarda la lista

        })
        .catch((err) =>
          console.error("❌ Error al cargar archivos del sitio:", err)
        );
    }
  }, [siteId, posts]);

  useEffect(() => {
    if (showUserModal) {
      setUsersState({ ...usersState, loading: true });
      listUsers(null, 0, 1000, searchTerm, 2) // Modulo 2 = Knowledge/Gestion documental
        .then((res) =>
          setUsersState({ users: res.data.content, loading: false, error: null })
          
        )
        .catch((err) =>
          setUsersState({ ...usersState, error: err.message, loading: false })
        );
    }
  }, [showUserModal]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await getUserId();
        setUsuarioLogueado(response.data);
      } catch (error) {
        console.error("Error al obtener ID de usuario:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (siteId?.id) {
      getUsuariosAsignados(siteId.id)
        .then((res) => setSelectedUsers(res.data))
        .catch((err) => {
          console.error("Error al obtener usuarios asignados:", err);
        });
    }
  }, [siteId]);

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers = usersState.users.filter(
    (user) =>
      `${user.nombre} ${user.apellido}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle usuario seleccionado en el modal
  const toggleUserSelection = (user) => {
    setUsuariosSeleccionadosModal((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Cuando se confirma agregar usuarios seleccionados
  const handleAddUsers = () => {
    const idsYaAsignados = selectedUsers.map((u) => u.id);
    const idsNuevos = usuariosSeleccionadosModal
      .filter((user) => !idsYaAsignados.includes(user.id))
      .map((user) => user.id);

    if (idsNuevos.length === 0) {
      alert("No hay usuarios nuevos para agregar.");
      return;
    }

    agregarUsuariosAsignados(siteId.id, idsNuevos)
      .then(() => {
        setShowUserModal(false);
        setSearchTerm("");
        setUsuariosSeleccionadosModal([]);
        getUsuariosAsignados(siteId.id).then((res) => setSelectedUsers(res.data));
      })
      .catch((err) => {
        console.error("Error al agregar usuarios:", err);
        alert("Error al agregar usuarios al sitio");
      });
  };

  // Manejo de envío de publicación (post)
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedFile) return;

    try {
      // Asegurarnos de que tenemos el ID del usuario logueado
      if (!usuarioLogueado) {
        const userIdResponse = await getUserId();
        setUsuarioLogueado(userIdResponse.data);
      }

      const uploadResponse = await uploadArchivo(
        selectedFile,
        null, // carpetaId si aplica
        usuarioLogueado,
        siteId.id
      );

      const archivoSubido = uploadResponse.data;

      const nuevaPublicacion = {
        id: Date.now(),
        text: newPost,
        file: {
          name: archivoSubido.nombre,
          type: archivoSubido.tipo.includes("image") ? "image" : "pdf",
          url: `/api/archivos/ver/${archivoSubido.id}`,
        },
        user: selectedUsers.find((u) => u.id === usuarioLogueado),
        timestamp: new Date().toLocaleString(),
      };

      setPosts((prev) => [...prev, nuevaPublicacion]);
      setNewPost("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Error al subir publicación:", err);
      alert("No se pudo subir el archivo. Verifica tu sesión.");
    }
  };

  return (
    <Container className="mt-4">
      <Button variant="outline-secondary" onClick={() => navigate("/knowledge/sites")} className="mb-3">
        <FaArrowLeft /> Volver a mis sitios
      </Button>

      <h2 className="mb-4">
          {site?.name} <small className="text-muted">(ID: {site.id})</small>
      </h2>

      <Row className="mt-3">
        {/* Contenedor Usuarios */}
        <Col md={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Usuarios ({selectedUsers.length})</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUserModal(true)}
              >
                <FaUserPlus /> Agregar
              </Button>
            </Card.Header>
            <Card.Body>
              {selectedUsers.length === 0 ? (
                <p>No hay usuarios agregados aún.</p>
              ) : (
                <ListGroup>
                  {selectedUsers.map((user) => (
                    <ListGroup.Item key={user.id}>
                      <div className="d-flex align-items-center">
                        <FaUser size={16} className="text-primary mr-2" />
                        <div>
                          <h6 className="mb-1">
                            {user.nombre} {user.apellido}
                          </h6>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Contenedor Publicaciones */}
        <Col md={4}>
          <Card>
            <Card.Header>Publicaciones</Card.Header>
            <Card.Body>
              <Form onSubmit={handlePostSubmit}>
                <Form.Group controlId="fileUpload" className="mt-2">
                  <Form.Control
                    type="file"
                    accept="image/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-2">
                  Publicar
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Contenedor Actividades Completadas (más grande) */}
        <Col md={4} >
          <Card style={{ height: "600px", overflowY: "auto" }} className="mb-2">
            <Card.Header className="fw-bold">Archivos subidos</Card.Header>
            <Card.Body className="p-2">
              {archivosSitio.length === 0 ? (
                <p className="text-muted">
                  No hay archivos subidos a este sitio.
                </p>
              ) : (
                [...archivosSitio]
                  .sort((a, b) => {
                    const dateA = new Date(a.fechaSubida);
                    const dateB = new Date(b.fechaSubida);
                    return dateA - dateB; // Orden descendente
                  })
                  .map((archivo) => (
                    <div
                      key={archivo.id}
                      className="d-flex align-items-start mb-2 p-2 border rounded bg-light"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {/* Icono / vista previa */}
                      <div className="me-2">
                        {archivo.fileType?.startsWith("image") ? (
                          <img
                            src={archivo.url}
                            alt={archivo.name}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <FaFilePdf size={30} className="text-danger" />
                        )}
                      </div>

                      {/* Info de archivo */}
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{archivo.name}</div>
                        <div className="text-muted">{archivo.size}</div>
                        <small className="text-muted">
                          Subido: {archivo.date}
                        </small>

                        {/* Usuario */}
                        {archivo.usuario && (
                          <div
                            className="mt-1 text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <FaUser className="me-1" />
                            {archivo.usuario.nombre} {archivo.usuario.apellido}
                          </div>
                        )}
                      </div>

                      {/* Botón de descarga */}
                      <div className="ms-2">
                        <a
                          href={archivo.url}
                          download
                          title="Descargar"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Descargar
                        </a>
                      </div>
                    </div>
                  ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para agregar usuarios */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar usuarios al sitio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </Form.Group>

          {usersState.loading && <p>Cargando usuarios...</p>}
          {usersState.error && (
            <p className="text-danger">
              Error al cargar usuarios: {usersState.error}
            </p>
          )}

          {!usersState.loading &&
            !usersState.error &&
            filteredUsers.length === 0 && <p>No se encontraron usuarios.</p>}

          <div
            className="list-group mt-3"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <div
                  key={user.id}
                  className={`list-group-item list-group-item-action ${
                    isSelected ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="d-flex align-items-center">
                    <FaUser
                      size={20}
                      className={isSelected ? "text-white" : "text-primary"}
                    />
                    <div className="flex-grow-1 ml-3">
                      <h5 className="mb-1">
                        {user.nombre} {user.apellido}
                      </h5>
                      <p className="mb-1 small">{user.email}</p>
                    </div>
                    <small>ID: {user.id}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUsers}
            disabled={selectedUsers.length === 0}
          >
            Agregar usuarios seleccionados
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SiteView;
