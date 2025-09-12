import React, { useState, useEffect } from "react";
import Documents from "./Documents";
import { SubMenu } from "../SubMenu/SubMenu";
import { useFileManager } from "../Funciones/Funcions";
import {
  BsFolderFill,
  BsFilePdf,
  BsTrash,
  BsStar,
  BsStarFill,
} from "react-icons/bs";
import { getArchivoUrl } from "../../../../services/MisArchivosService";
import ImagePreview from "../../../../components/Chat/ImagePreview";
import { FaFileExcel } from "react-icons/fa";

const MisArchivos = () => {
  const {
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
  } = useFileManager();

  // Handler para visualizar archivos (ej. PDF) en una nueva pestaña
  const handleViewFile = async (item) => {
    try {
      const blob = await getArchivoUrl(item.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Nota: El blob URL se mantiene vivo hasta que la pestaña se cierra.
    } catch (error) {
      console.error("Error al visualizar el archivo:", error);
      alert("No se pudo abrir el archivo.");
    }
  };

  // Handler para descargar cualquier tipo de archivo
  const handleDownloadFile = async (item) => {
    try {
      const blob = await getArchivoUrl(item.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      alert("No se pudo descargar el archivo.");
    }
  };

  return (
    <>
      <div className="top-bar">
        <Documents
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
        <button className="top-button active">Mis archivos</button>
        {/* <Categorias />
        <Etiquetas /> */}
      </div>

      <div className="content">
        <h1>
          Mis Archivos{" "}
          {currentFolder && (
            <button
              className="btn btn-sm btn-outline-secondary ms-3"
              onClick={goBack}
            >
              Volver
            </button>
          )}
        </h1>

        <SubMenu
          onFileUpload={handleFileUpload}
          onCreateFolder={handleCreateFolder}
          acceptFileTypes="image/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />

        <div className="uploaded-files-container mt-3">
          {getFilteredItems().length > 0 ? (
            getFilteredItems().map((item) => {
              const viewUrl = `${
                import.meta.env.VITE_API_BASE_URL
              }/archivos/ver/${item.id}`;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="uploaded-file mb-3 p-3 border rounded"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {item.type === "folder" ? (
                        <button
                          className="btn btn-sm me-2 p-0"
                          onClick={() => enterFolder(item.id)}
                        >
                          <BsFolderFill size={24} color="#4e73df" />
                        </button>
                      ) : item.fileType === "application/pdf" ? (
                        <button
                          className="btn btn-link p-0 me-3"
                          onClick={() => handleViewFile(item)}
                        >
                          <BsFilePdf size={24} color="#e74a3b" />
                        </button>
                      ) : item.fileType.startsWith("image") ? (
                        <div className="me-3" style={{ width: "40px", height: "40px" }}>
                          <ImagePreview src={viewUrl} alt={item.name} />
                        </div>
                      ) : item.fileType === "application/vnd.ms-excel" ||
                        item.fileType ===
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                        <button
                          className="btn btn-link p-0 me-3"
                          onClick={() => handleDownloadFile(item)}
                        >
                          <FaFileExcel size={24} color="#1d6f42" />
                        </button>
                      ) : (
                        <button
                          className="btn btn-link p-0"
                          onClick={() => handleDownloadFile(item)}
                        >
                          {item.name}
                        </button>
                      )}
                      <div>
                        <h5 className="mb-1">{item.name}</h5>
                        <div className="file-details">
                          <span>
                            {item.type === "file" ? item.size : "Carpeta"}
                          </span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    {item.type === "file" && (
                      <button
                        className="btn btn-sm favorite-btn"
                        onClick={() => toggleFavorite(item.id)}
                        title={
                          favorites.includes(item.id)
                            ? "Quitar de favoritos"
                            : "Añadir a favoritos"
                        }
                      >
                        {favorites.includes(item.id) ? (
                          <BsStarFill color="gold" />
                        ) : (
                          <BsStar />
                        )}
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveItem(item)}
                    >
                      <BsTrash size={14} />
                    </button>
                    {item.type === "file" && (
                      <>
                        <button
                          className="btn btn-sm favorite-btn"
                          title={
                            favorites.includes(item.id)
                              ? "Marcar a Ivan Sistemas "
                              : "Marcar a Eduardo Sistemas"
                          }
                        ></button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleDownloadFile(item)}
                        >
                          Descargar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted">
              {currentFolder
                ? "La carpeta está vacía. Sube archivos aquí."
                : currentFilter === "favorites"
                ? "No tienes documentos marcados como favoritos"
                : "No hay elementos. Sube archivos o crea carpetas."}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MisArchivos;
