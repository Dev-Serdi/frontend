import React from "react";
import {
  FaHome,
  FaFileAlt,
  FaGlobe,
  FaTasks,
  FaUsers,
  FaTrashAlt,
  FaRegFile,
} from "react-icons/fa";
import {
  MdSupportAgent,
  MdTaskAlt,
  MdOutlinePendingActions,
  MdSettings,
} from "react-icons/md";
import { PiFolderSimpleUser } from "react-icons/pi";
import { MdAdminPanelSettings } from "react-icons/md";
import { BsFillPassFill, BsIncognito } from "react-icons/bs";
import { GoGraph } from "react-icons/go";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { BiTask } from "react-icons/bi";
import { IoLocationOutline } from "react-icons/io5";

const linkData = [
  {
    label: "Helpdesk",
    icon: <MdSupportAgent />,
    children: [
      {
        label: "Tickets",
        link: "/helpdesk/tasks",
        icon: <FaTasks />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },{
        label: "Mis tickets",
        link: "/helpdesk/mytickets",
        icon: <BsFillPassFill />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "En proceso",
        link: "/helpdesk/en-proceso/en-proceso",
        icon: <MdOutlinePendingActions />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "Completados",
        link: "/helpdesk/completados/completados",
        icon: <BiTask/>,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "Cerrados",
        link: "/helpdesk/cerrados/cerrados",
        icon: <MdTaskAlt />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "Eliminados",
        link: "/helpdesk/trash",
        icon: <FaTrashAlt />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
    ],    
  },
  {
    label: "Gestión Documental",
    icon: <PiFolderSimpleUser />,
    children: [
      {
        label: "Inicio",
        link: "/knowledge/home",
        icon: <FaHome />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      {
        label: "Mis Archivos",
        link: "/knowledge/myfile",
        icon: <FaFileAlt />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      {
        label: "Sitios",
        link: "/knowledge/sites",
        icon: <FaGlobe />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      {
        label: "Tareas",
        link: "/knowledge/task",
        icon: <FaTasks />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      {
          label: "Eliminados",
          link: "/knowledge/eliminados",
          icon: <FaTrashAlt/>,
          roles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
      },
    ],
  },
  {
    label: "Administración",
    icon: <MdAdminPanelSettings />,
    children: [
      {
        label: "Helpdesk",
        icon: <MdSupportAgent />,
        children: [ 
          {
            label: "Departamentos",
            link: "/admin/helpdesk/departamentos",
            icon: <HiOutlineBuildingStorefront  />,
            roles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"]
          },
          {
            label: "Prioridades",
            link: "/admin/helpdesk/prioridades",
            icon: <MdOutlinePendingActions />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Incidencias",
            link: "/admin/helpdesk/incidencias",
            icon: <FaRegFile />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Ubicaciones",
            link: "/admin/helpdesk/ubicaciones",
            icon: <IoLocationOutline/>,
            roles: ["ROLE_ADMIN"]
          },          
        ]
      },
      
      {
        label: "Usuarios",
        icon: <PiFolderSimpleUser />,  
        children: [ 
          {
            label: "Todos",
            link: "/admin/usuarios/todos",
            icon: <FaUsers />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Logs",
            link: "/admin/usuarios/logs",
            icon: <MdSettings />,
            roles: ["ROLE_ADMIN"]
          }
        ]
      },
      {
        label: "Reportes",
        icon: <GoGraph />,
        children: [
          {
            label: "Departamentos",
            link: "/admin/reportes/departamentos",
            icon: <HiOutlineBuildingStorefront   />,
            roles: ["ROLE_ADMIN"]  
          },
          {
            label: "Agentes",
            link: "/admin/reportes/agentes",
            icon: <BsIncognito/>,
            roles: ["ROLE_ADMIN"]  
          },
          {
            label: "Tickets",
            link: "/admin/reportes/tickets",
            icon: <BsFillPassFill/>,
            roles: ["ROLE_ADMIN"]  
          }
        ]
      }
    ],
  },
];
export default linkData;
