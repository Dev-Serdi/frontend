import { useState, useEffect } from "react";
import {
  createCarpeta,
  getAllCarpetas,
  uploadArchivo,
  getArchivoUrl,
  getArchivosPorCarpeta,
  getArchivosSinCarpeta,
  desactivarArchivo,
  desactivarCarpeta,
  getUserId
} from "../../../../services/MisArchivosService";
import { getCarpetasByUsuario } from "../../../../services/MisArchivosService";


export const useFileManager = () => {
  const [usuarioId, setUsuarioId] = useState(null);
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("all");

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Obtener el ID del usuario al iniciar

useEffect(() => {
  const obtenerUsuarioId = async () => {
    try {
      const response = await getUserId();
      const id = response.data;
      setUsuarioId(id);
    } catch (error) {
      console.error("❌ No se pudo obtener el ID del usuario:", error);
    }
  };

  obtenerUsuarioId();
}, []);

  // ✅ Obtener carpetas y archivos cada vez que cambia currentFolder o usuarioId
  useEffect(() => {
    const fetchData = async () => {
      if (!usuarioId) return;

      try {
        const carpetasResponse = await getCarpetasByUsuario(usuarioId);
        const carpetas = carpetasResponse.data.map((c) => ({
          id: c.id,
          type: "folder",
          name: c.nombre,
          date: new Date(c.fechaCreacion).toLocaleDateString(),
          parentId: c.carpetaPadreId,
        }));

        let archivos = [];

        if (currentFolder !== null) {
          const archivosResponse = await getArchivosPorCarpeta(currentFolder, usuarioId);
          archivos = archivosResponse.data.map((a) => ({
            id: a.id,
            type: "file",
            name: a.nombre,
            fileType: a.tipo,
            size: (a.tamaño / 1024).toFixed(2) + " KB",
            date: new Date(a.fechaSubida).toLocaleDateString(),
            parentId: a.carpetaId,
            isFavorite: favorites.includes(a.id),
            url: getArchivoUrl(a.id),
          }));
        } else {
          const response = await getArchivosSinCarpeta(usuarioId);
          archivos = response.data
            .filter((a) => a.carpetaId === null)
            .map((a) => ({
              id: a.id,
              type: "file",
              name: a.nombre,
              fileType: a.tipo,
              size: (a.tamaño / 1024).toFixed(2) + " KB",
              date: new Date(a.fechaSubida).toLocaleDateString(),
              parentId: null,
              isFavorite: favorites.includes(a.id),
              url: getArchivoUrl(a.id),
            }));
        }

        const carpetasFiltradas =
          currentFolder === null
            ? carpetas.filter((c) => c.parentId === null)
            : carpetas.filter((c) => c.parentId === currentFolder);

        setItems([...carpetasFiltradas, ...archivos]);
      } catch (error) {
        console.error("❌ Error al cargar carpetas o archivos:", error);
      }
    };

    fetchData();
  }, [currentFolder, usuarioId]);

  // ✅ Subir archivo
  const handleFileUpload = async (file) => {
    if (!usuarioId) {
      console.warn("⏳ usuarioId no definido aún, no se puede subir archivo");
      return;
    }

    try {
      const response = await uploadArchivo(file, currentFolder, usuarioId);
      const data = response.data;

      const newItem = {
        id: data.id,
        type: "file",
        fileObject: file,
        name: data.nombre,
        fileType: data.tipo,
        size: (file.size / 1024).toFixed(2) + " KB",
        date: new Date(data.fechaSubida).toLocaleDateString(),
        parentId: currentFolder,
        isFavorite: false,
        url: getArchivoUrl(data.id),
      };

      setItems((prev) => [...prev, newItem]);
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
    }
  };

  // ✅ Crear carpeta
  const handleCreateFolder = async (folderName) => {
    if (!usuarioId) {
      console.warn("⏳ usuarioId no definido aún, no se puede crear carpeta");
      return;
    }

    const carpetaDto = {
      nombre: folderName,
      carpetaPadreId: currentFolder,
    };

    try {
      const response = await createCarpeta(carpetaDto, usuarioId);
      const nuevaCarpeta = response.data;

      setItems((prev) => [
        ...prev,
        {
          id: nuevaCarpeta.id,
          type: "folder",
          name: nuevaCarpeta.nombre,
          date: new Date(nuevaCarpeta.fechaCreacion).toLocaleDateString(),
          parentId: nuevaCarpeta.carpetaPadreId,
        },
      ]);
    } catch (error) {
      console.error("❌ Error al crear carpeta:", error);
    }
  };

  const toggleFavorite = (itemId) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

const handleRemoveItem = async (item) => {
  try {
    if (item.type === "folder") {
      await desactivarCarpeta(item.id);
    } else {
      await desactivarArchivo(item.id);
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
  } catch (error) {
    console.error("❌ Error al desactivar:", error);
  }
};

  const enterFolder = (folderId) => setCurrentFolder(folderId);
  const goBack = () => setCurrentFolder(null);

  const getFilteredItems = () => {
    const currentItems = items.filter((item) =>
      currentFolder === null
        ? item.parentId == null
        : String(item.parentId) === String(currentFolder)
    );

    switch (currentFilter) {
      case "favorites":
        return currentItems.filter((item) => favorites.includes(item.id));
      case "recent":
        return [...currentItems].sort((a, b) => new Date(b.date) - new Date(a.date));
      default:
        return currentItems;
    }
  };

  return {
    items,
    currentFolder,
    currentFilter,
    setCurrentFilter,
    favorites,
    handleFileUpload,
    handleCreateFolder,
    toggleFavorite,
    handleRemoveItem,
    enterFolder,
    goBack,
    getFilteredItems,
  };
};
