import React, { useState, useEffect } from "react";
import Documents from "./Documents";
import Categorias from "./Categorias";
import Etiquetas from "./Etiquetas";
import { SubMenu } from "../SubMenu/SubMenu";
import { useFileManager } from "../Funciones/Funcions";
import {
  BsFolderFill,
  BsFilePdf,
  BsImage,
  BsTrash,
  BsStar,
  BsStarFill,
} from "react-icons/bs";
import { get } from "react-hook-form";
import { getArchivoUrl } from "../../../../services/MisArchivosService";

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
            getFilteredItems().map((item) => (
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
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BsFilePdf size={24} color="#e74a3b" className="me-3" />
                      </a>
                    ) : item.fileType.startsWith("image") ? (
                      <img
                        src={item.url || URL.createObjectURL(item.fileObject)}
                        alt="Imagen"
                        className="file-preview-img me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : item.fileType === "application/vnd.ms-excel" || item.fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BsFilePdf size={24} color="#1d6f42" className="me-3" />
                      </a>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.name}
                      </a>
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
                        <a
                          href={getArchivoUrl(item.id)}
                          download
                          className="btn btn-sm btn-outline-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Descargar
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
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