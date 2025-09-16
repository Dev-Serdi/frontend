import React, { useState, useEffect } from "react";
import {
  FiPlus,
} from "react-icons/fi";
import { MdOutlineWorkOutline } from "react-icons/md";
import TaskList from "./ComponentsKnow/Task_Components/TaskList";
import TaskForm from "./ComponentsKnow/Task_Components/TaskForm";
import { listUsers, getUserRoles } from "../../services/UsuarioService";
import { getAllActivities } from "../../services/ActivityService";
import { deleteActivity } from "../../services/ActivityService";
import { updateActivity } from "../../services/ActivityService"; // Asegúrate de importar la función correcta

const Task = () => {
  // Estados para manejar actividades, formulario, filtros y usuarios
  const [activities, setActivities] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState(false);
  const [usuarios, setUsuarios] = useState([]); // Lista de usuarios para asignación de tareas
  const [userRoles, setUserRoles] = useState([]);

  const handleDeleteTask = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta actividad?")) return;
    try {
      await deleteActivity(id);
      const updated = activities.filter((a) => a.id !== id);
      setActivities(updated);
    } catch (err) {
      console.error("Error al eliminar actividad:", err);
      alert("No se pudo eliminar la actividad.");
    }
  };

  const isAuth = localStorage.getItem("authToken"); // Verifica si hay token de autenticación
  // Efecto para cargar usuarios si el usuario está autenticado
  useEffect(() => {
    const fetchActivities = async () => {
      await listActivities();
    };
    const fetchUserPermissions = async () => {
      // New function to fetch roles
      try {
        const response = await getUserRoles(); // Calls the service to get user roles
        setUserRoles(response.data); // Stores the roles in state
      } catch (error) {
        console.error("Error al obtener roles del usuario:", error);
      }
    };

    if (isAuth) {
      fetchActivities();
      fetchUserPermissions(); // Call the new function
    }
  }, [isAuth]);

  async function listActivities() {
    const response = await getAllActivities();

    setActivities(response.data);
  }

  // Efecto para cargar usuarios si el usuario está autenticado
  useEffect(() => {
    const fetchUsers = async () => {
      await getAllUsers();
    };

    if (isAuth) fetchUsers();
  }, [isAuth]);

  // Obtiene todos los usuarios desde el servicio
  async function getAllUsers() {
    const response = await listUsers(null,0, 1000, "", 2);
    setUsuarios(response.data.content);
  }

  // Guarda las actividades actualizadas en estado y localStorage
  const saveActivities = (updatedActivities) => {
    setActivities(updatedActivities);
  };

  // Maneja la creación o edición de una actividad
  const handleSaveActivity = (activityData) => {
    let updatedActivities;

    if (editingTask) {
      // Si estamos editando, actualizamos la actividad existente
      updatedActivities = activities.map((activity) =>
        activity.id === editingTask.id
          ? { ...activity, ...activityData }
          : activity
      );
    } else {
      // Si es una nueva, la agregamos con un id único y estado inicial
      updatedActivities = [
        ...activities,
        {
          ...activityData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: "Pendiente",
        },
      ];
    }
    saveActivities(updatedActivities);
    setShowTaskForm(false); // Cierra el formulario después de guardar
    setEditingTask(null); // Limpia el estado de la tarea en edición
  };

  // Filtra las actividades según el estado seleccionado (todas, pendientes o completadas)
  const filteredActivities = activities.filter((activity) => {
    if (filter === true) return activity.status === true;
    if (filter === false) return activity.status === false;
    return true;
  });

  // Separa las actividades por tipo: tareas y flujos de trabajo
  const tasks = filteredActivities.filter((a) => a.type === "task");
  const workflows = filteredActivities.filter((a) => a.type === "workflow");

  const canCreateActivity = () => {
    return userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_SUPERVISOR');
  };

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        {/* Título y descripción */}
        <div>
          <h1 className="h3 mb-0 text-primary">
            <MdOutlineWorkOutline size={24} className="me-2" />
            Gestor de Productividad
          </h1>
          <p className="text-muted mb-0">
            Organiza tus tareas y flujos de trabajo
          </p>
        </div>

        {/* Botones para crear tarea y filtrar */}
        <div>
          {canCreateActivity() && ( // Conditionally render the button based on permission
            <button
              className="btn btn-primary me-2"
              onClick={() => {
                setShowTaskForm(true);
                setEditingTask(null);
              }}
            >
              <FiPlus className="me-1" />
              Crear Nuevo
            </button>
          )}
          {/* Filtros por estado */}
          <div className="btn-group">
            <button
              className={`btn btn-outline-secondary ${
                filter === "all" ? "active" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>
            <button
              className={`btn btn-outline-secondary ${
                filter === false ? "active" : ""
              }`}
              onClick={() => setFilter(false)}
            >
              Pendientes
            </button>
            <button
              className={`btn btn-outline-secondary ${
                filter === true ? "active" : ""
              }`}
              onClick={() => setFilter(true)}
            >
              Completadas
            </button>
          </div>
        </div>
      </header>

      {/* Lista de tareas y flujos, solo si está expandido */}
      {isExpanded && (
        <TaskList
          tasks={tasks}
          workflows={workflows}
          users={usuarios}
          onEditTask={(task) => {
            setEditingTask(task);
            setShowTaskForm(true);
          }}
          onToggleComplete={async (id) => {
            const updatedActivities = activities.map((activity) => {
              if (activity.id === id) {
                const isCompleted = activity.status === true;
                return {
                  ...activity,
                  status: isCompleted ? false : true,
                  completedAt: isCompleted ? null : new Date().toISOString(),
                };
              }
              return activity;
            });

            const updated = updatedActivities.find((a) => a.id === id);

            try {
              await updateActivity(updated); // 🔁 persistencia real
              saveActivities(updatedActivities); // 🔄 actualizar frontend
            } catch (err) {
              console.error("Error al actualizar estado:", err);
              alert("Error al cambiar el estado de la actividad.");
            }
          }}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Formulario para crear o editar tareas */}
      {showTaskForm && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSave={handleSaveActivity}
          users={usuarios}
          taskToEdit={editingTask}
        />
      )}
    </div>
  );
};

export default Task;
