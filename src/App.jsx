import React, { useState } from "react";
// import MicrosoftSignUp from "./components/MicrosoftAuth/SignupButton";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import UsersComponent from "./components/Users/UsersComponent";
import TaskDetails from "./pages/Helpdesk/TaskDetails";
import SharedFile from "./pages/Knowledge/SharedFile";
import Repository from "./pages/Knowledge/Repository";
import AdminTools from "./pages/Knowledge/AdminTools";
import ProtectedRoute from "./pages/ProtectedRoute";
import { Transition } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import People from "./pages/Knowledge/People";
import MyFile from "./pages/Knowledge/MyFile";
import Sites from "./pages/Knowledge/Sites";
import Sidebar from "./components/Sidebar";
import Tasks from "./pages/Helpdesk/Tasks";
import Trash from "./pages/Helpdesk/Trash";
import Users from "./pages/Admin/Users";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Knowledge/Home";
import Task from "./pages/Knowledge/Task";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import Eliminados from "./pages/Knowledge/Eliminados";
import { Toaster } from "sonner";
import { Incidencias } from "./pages/Helpdesk/Admin/Incidencias";
import { Ubicaciones } from "./pages/Helpdesk/Admin/Ubicaciones";
import { Departamentos } from "./pages/Helpdesk/Admin/Departamentos";
import { Logs } from "./pages/Admin/Logs";
import { Prioridades } from "./pages/Helpdesk/Admin/Prioridades";
import { ReporteDepartamentos } from "./pages/Admin/ReporteDepartamentos";
import { ReporteAgentes } from "./pages/Admin/ReporteAgentes";
import { ReporteTasks } from "./pages/Admin/ReporteTasks";
import { AddDepartamento } from "./components/Generic/AddDepartamento";
import { AddPrioridad } from "./components/Generic/AddPrioridades";
import { AddIncidencia } from "./components/Generic/AddIncidencias";
import { AuthProvider} from "./components/AuthContext";
import Perfil from "./components/Users/Perfil";
import { AddUbicacion } from "./components/Generic/AddUbicacion";
import { ReadedNotifications } from "./components/Generic/ReadedNotifications";
import { DepartamentosDetalle } from "./pages/Helpdesk/Admin/DepartamentosDetalle";
import { PerfilDetalles } from "./components/Users/PerfilDetalles";
import { Privacy } from "./pages/Privacy";
import SiteView from "./pages/Knowledge/ComponentsKnow/Sites_Components/SiteView";

function Layout() {
  const isAuthenticated = localStorage.getItem("authToken");
  const { pathname } = useLocation();
  const isDashboard = pathname === "/dashboard";
  const isSignUp = pathname === "/signup";
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className="min-h-screen flex flex-col"
    >
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar para escritorio */}
        {isAuthenticated !== null && !isDashboard && !isSignUp && (
          <div className="hidden md:block sticky top-0 h-[calc(100vh)]">
            <Sidebar />
          </div>
        )}

        {/* Sidebar para móvil */}
        {isAuthenticated !== null && isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-gray-600 opacity-75"
              onClick={toggleSidebar}
            ></div>
            <div className="relative flex-1 pt-4 flex flex-col max-w-cl w-full bg-gray-50">
              <div className="absolute top-0 right-0 pt-2">
                <button
                  onClick={toggleSidebar}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto pt-2 pb-0 p-3 2xl:px-10">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </Transition>
  );
}

function App() {
  return (
    <main className="w-full min-h-screen bg-[#e7ebf3]">
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            index
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Rutas públicas o que manejan su propia lógica de autenticación (como Dashboard) */}
          <Route element={<Layout />}>
            {/* <Route path="/signup" element={<MicrosoftSignUp />} /> */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Rutas protegidas accesibles para todos los usuarios autenticados */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_USER", "ROLE_AGENT"]}
              />
            }
          >
            <Route element={<Layout />}>
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/perfil/:id" element={<PerfilDetalles />} />
              <Route path="/helpdesk/task/:id" element={<TaskDetails/>}/> 
              <Route path="/notifications/readed" element={<ReadedNotifications />} />
            </Route>
          </Route>

          {/* Rutas protegidas específicas para Usuarios */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_USER"]}
              />
            }
          >
            <Route element={<Layout />}>
              <Route path="/knowledge/home" element={<Home />} />
              <Route path="/knowledge/myfile" element={<MyFile />} />
              <Route path="/knowledge/sharedfile" element={<SharedFile />} />
              <Route path="/knowledge/sites" element={<Sites />} />
              <Route path="/knowledge/sites/:id" element={<SiteView />} />
              <Route path="/knowledge/task" element={<Task />} />
              <Route path="/knowledge/people" element={<People />} />
              <Route path="/knowledge/repository" element={<Repository />} />
              <Route path="/knowledge/eliminados" element={<Eliminados />} />
              <Route path="/notifications/readed" element={<ReadedNotifications />} />
            </Route>
          </Route>
          {/* Rutas protegidas especificas para Agentes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_AGENT"]}
              />
            }
          >
            <Route element={<Layout />}>
              <Route path="/helpdesk/tasks" element={<Tasks />} />
              <Route
                path="/helpdesk/mytickets"
                element={<Tasks userTicketsOnly={true} />}
              />
              <Route path="/helpdesk/completados/:estado" element={<Tasks />} />
              <Route path="/helpdesk/en-proceso/:estado" element={<Tasks />} />
              <Route path="/helpdesk/cerrados/:estado" element={<Tasks />} />
              <Route path="/helpdesk/trash" element={<Trash />} />
            </Route>
          </Route>
          {/*Agregar rutas protegidas especificas para supervisores en caso de ser necesario */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_SUPERVISOR"]}
              />
            }
          >
            <Route element={<Layout />}>
              <Route path="/admin/usuarios/todos" element={<Users />} /> 
              <Route
                path="/admin/helpdesk/departamentos"
                element={<Departamentos />}
              />
              <Route 
                path="/admin/helpdesk/departamentos/detalle/:id" 
                element={<DepartamentosDetalle />} 
              />
            </Route>

          </Route>

          {/* Rutas protegidas específicas para Administradores */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route element={<Layout />}>
              <Route
                path="/admin/helpdesk/users/add-user"
                element={<UsersComponent />}
              />
              <Route
                path="/admin/knowledge/edit-user/:id"
                element={<UsersComponent  />}
              />
              <Route
                path="/admin/edit-user/:id"
                element={<UsersComponent />}
              />
              <Route
                path="/admin/helpdesk/incidencias"
                element={<Incidencias />}
              />
              
              <Route
                path="/admin/helpdesk/prioridades"
                element={<Prioridades />}
              />
              <Route
                path="/admin/helpdesk/ubicaciones"
                element={<Ubicaciones/>}
              />
              <Route path="/admin/usuarios/logs" element={<Logs />} />
              <Route
                path="/admin/reportes/departamentos"
                element={<ReporteDepartamentos />}
              />
              <Route
                path="/admin/reportes/agentes"
                element={<ReporteAgentes />}
              />
              <Route
                path="/admin/reportes/tickets"
                element={<ReporteTasks />}
              />
              <Route path="/admin/usuarios" element={<Logs />} />
              <Route
                path="/knowledge/admintools"
                element={<AdminTools />}
              />{" "}
              <Route
                path="/admin/helpdesk/departamentos/nuevo"
                element={<AddDepartamento />}
              />
              <Route
                path="/admin/helpdesk/departamentos/editar/:id"
                element={<AddDepartamento />}
              />
              <Route
                path="/admin/helpdesk/ubicaciones/editar/:id"
                element={<AddUbicacion />}
              />
              <Route
                path="/admin/helpdesk/incidencias/editar/:id"
                element={<AddIncidencia />}
              />
              <Route
                path="/admin/helpdesk/ubicaciones/nuevo"
                element={<AddUbicacion />}
              />
              <Route
                path="/admin/helpdesk/incidencias/nuevo"
                element={<AddIncidencia />}
              />
              <Route
                path="/admin/helpdesk/prioridades/nuevo"
                element={<AddPrioridad />}
              />
              <Route
                path="/admin/usuarios/todos"
                element={<Users /> /* Componente para gestionar usuarios */}
              ></Route>
              {/* Ejemplo: si es solo para admin */}
            </Route>
          </Route>

          {/* Ruta NotFound general */}
          {/* Es buena idea que NotFound también use el Layout si quieres mantener la UI */}
          <Route element={<Layout />}>
            <Route path="/notfound" element={<NotFound />} />
          </Route>
          {/* Captura todas las demás rutas y redirige a /notfound */}
          <Route path="*" element={<Navigate to="/notfound" replace />} />
        </Routes>
      </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </main>
  );
}
export default App;
