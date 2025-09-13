import React, { useCallback, useEffect, useState } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams, useLocation } from "react-router-dom";
import { Transition } from "@headlessui/react";

// Componentes locales
import Tabs from "../../components/Tabs/Tabs";
import BoardView from "../../components/Ticket/BoardView";
import Table from "../../components/Ticket/Table";
import PaginationBar from "../../components/Ticket/PaginadoTickets";
import CreateTicket from "../../components/Ticket/modal/CreateTicket";

// Servicios y utilidades
import {
  listTickets,
  listFilteredTickets,
  listTicketsByUser,
  searchTickets,
  listUnansweredTickets, // <-- Importar el nuevo servicio
} from "../../services/TicketService";
import { listAllDepartamentos } from "../../services/DepartamentoService";
import { getUserId } from "../../services/UsuarioService";
import { SiZebpay } from "react-icons/si";

/**
 * @constant TABS
 * @description Configuración para las pestañas de visualización (Cuadrícula y Lista).
 * @type {Array<object>}
 */
const TABS = [
  { title: "Cuadrícula", icon: <MdGridView /> },
  { title: "Lista", icon: <FaList /> },
];

/**
 * @function useQuery
 * @description Hook personalizado para obtener los parámetros de consulta de la URL.
 * @returns {URLSearchParams} Objeto con los parámetros de búsqueda.
 */
const useQuery = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};
const PAGE_SIZES = [8, 12, 16, 20]; // Opciones de paginación

/**
 * @component Tasks
 * @description Componente principal para mostrar y gestionar la lista de tickets.
 * Permite visualizar tickets en formato de cuadrícula o tabla, filtrar por estado/departamento/usuario,
 * paginar resultados y manejar estados de carga/error.
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} [props.userTicketsOnly=false] - Si es true, muestra solo los tickets del usuario actual
 * @returns {JSX.Element} El componente renderizado.
 */
const Tasks = ({ userTicketsOnly = false }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const params = useParams();
  const query = useQuery();

  // Estados del componente
  const [size, setSize] = useState(PAGE_SIZES[0]); // Estado para el tamaño de página
  const [searchTerm, setSearchTerm] = useState("");
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [errorConexion, setErrorConexion] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [userId, setUserId] = useState(0);
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [unansweredFilter, setUnansweredFilter] = useState(false);


  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("selectedTab");
    const initialSelected = saved !== null ? Number(saved) : 0;
    return [0, 1, 2].includes(initialSelected) ? initialSelected : 0;
  });
  const [inputValue, setInputValue] = useState(""); // Nuevo estado para el valor temporal del input

  /**
   * @description Estado del ticket extraído de los parámetros de la URL o query params
   * Prioridad: params.estado > query.get('estado') > ''
   */
  const status = params?.estado || query.get("estado") || "";

  /**
   * @function fetchDepartamentos
   * @description Obtiene la lista de departamentos desde la API
   */
  const fetchDepartamentos = useCallback(async () => {
    try {
      const response = await listAllDepartamentos();
      setDepartamentos(response.data || []);
    } catch (error) {
      console.error("Error fetching departamentos:", error);
      setDepartamentos([]);
    }
  }, []);

  /**
   * @function fetchTickets
   * @description Obtiene tickets según los filtros aplicados
   */
  // --- Lógica de `fetchTickets` actualizada ---
  const fetchTickets = useCallback(
    async (
      page,
      filterStatus = "",
      filterDepartamento = "",
      search = "",
      unanswered = false,
      pageSize = size // Usar el estado size
    ) => {
      setLoading(true);
      setErrorConexion(false);
      setTickets([]);
      setTotalPages(0);

      try {
        let response;
        const user = await getUserId();
        const currentUserId = user.data;
        setUserId(currentUserId);

        if (unanswered && !userTicketsOnly) {
          response = await listUnansweredTickets(
            page,
            filterDepartamento,
            filterStatus,
            undefined,
            pageSize
          );
        } else if (search) {
          response = await searchTickets(search);
        } else if (userTicketsOnly && currentUserId) {
          response = await listTicketsByUser(currentUserId, page, pageSize, 1);
          if (unanswered) {
            response = await listUnansweredTickets(
              page,
              filterDepartamento,
              filterStatus,
              currentUserId,
              pageSize
            );
          }
        } else if (filterStatus) {
          response = await listFilteredTickets(
            page,
            filterStatus,
            filterDepartamento,
            pageSize
          );
        } else {
          response = await listTickets(page, pageSize, filterDepartamento);
        }
        setTickets(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setErrorConexion(true);
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    },
    [userTicketsOnly, size]
  );

  useEffect(() => {
    fetchTickets(
      pagina,
      status,
      selectedDepartamento,
      searchTerm,
      unansweredFilter,
      size
    );
  }, [
    pagina,
    status,
    selectedDepartamento,
    searchTerm,
    unansweredFilter,
    fetchTickets,
    size,
  ]);

  useEffect(() => {
    fetchDepartamentos();
  }, [fetchDepartamentos]);

  useEffect(() => {
    setPagina(0);
  }, [status, selectedDepartamento, userTicketsOnly, unansweredFilter]); // <-- Añadir filtro a dependencias

  useEffect(() => {
    localStorage.setItem("selectedTab", selected);
  }, [selected]);

  // --- Nuevo handler para el botón de filtro ---
  const handleUnansweredFilterToggle = () => {
    setUnansweredFilter((prev) => !prev);
  };

  // Handlers
  const handleTabChange = useCallback((index) => setSelected(index), []);
  const handleDepartamentoChange = useCallback(
    (departamento) => setSelectedDepartamento(departamento),
    []
  );
  const handleCreateTicket = () => setOpenDialog(true);
  const nextPage = () => setPagina((p) => (p < totalPages - 1 ? p + 1 : p));
  const prevPage = () => setPagina((p) => (p > 0 ? p - 1 : p));
  // Función para manejar la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchTerm(inputValue);
      setPagina(0);
    }
  };

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setInputValue("");
    setSearchTerm("");
  };

  // Renderizado condicional durante la carga
  if (loading) {
    return (
      <div className="p-5 text-center" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-30 w-30 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="m-2 text-gray-600">Cargando tickets...</p>
      </div>
    );
  }

  return (
    <Transition
      as="div"
      appear
      show={!loading}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className="w-full h-full flex flex-col "
    >
      <div className="flex-1 overflow-auto min-h-150">
        <Tabs
          tabs={TABS}
          selected={selected}
          setSelected={handleTabChange}
          status={status}
          departamentos={departamentos}
          selectedDepartamento={selectedDepartamento}
          onDepartamentoChange={handleDepartamentoChange}
          onCreateTicket={handleCreateTicket}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleKeyDown={handleKeyDown}
          clearSearch={clearSearch}
          setSearchTerm={setSearchTerm}
          setPagina={setPagina}
          size={size} // <-- NUEVO
          setSize={setSize} // <-- NUEVO
          PAGE_SIZES={PAGE_SIZES}
          onUnansweredFilterChange={handleUnansweredFilterToggle}
          isUnansweredFilterActive={unansweredFilter}
        >
          {!status && selected === 0 && (
            <div className="text-center w-full text-l font-bold"></div>
          )}

          {selected === 0 ? (
            <BoardView
              userId={userId}
              tickets={tickets}
              fetchTickets={fetchTickets}
            />
          ) : (
            <div className="pb-2 w-full overflow-x-auto">
              <Table tickets={tickets} 
                      userId={userId}/>
            </div>
          )}
        </Tabs>
        {errorConexion && (
          <div className="text-red-600 text-center mt-4 px-4 py-2 border border-red-300 bg-red-50 rounded">
            Error al cargar los tickets. Por favor, revisa tu conexión e
            inténtalo de nuevo.
          </div>
        )}

        {!loading && !errorConexion && tickets.length === 0 && (
          <div className="text-gray-500 text-center mt-4">
            {userTicketsOnly
              ? "No tienes ningún ticket pendiente."
              : `No se encontraron tickets${
                  status ? ` con el estado "${status.replace("-", " ")}"` : ""
                }${
                  selectedDepartamento ? ` en el departamento seleccionado` : ""
                }.`}
          </div>
        )}
      </div>
      <PaginationBar
        currentPage={pagina}
        totalPages={totalPages}
        onPrev={prevPage}
        onNext={nextPage}
        isPrevDisabled={pagina === 0}
        isNextDisabled={pagina >= totalPages - 1}
      />
      <CreateTicket
        open={openDialog}
        setOpen={setOpenDialog}
        onTicketCreated={() => {
          fetchTickets(pagina, status, selectedDepartamento);
        }}
      />
    </Transition>
  );
};

export default Tasks;
