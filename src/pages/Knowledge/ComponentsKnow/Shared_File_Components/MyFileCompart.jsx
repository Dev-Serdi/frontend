import React, { useState, useEffect } from 'react';
import DocumentosCompart from './DocumentosCopart';
import CategoriesCompart from './CategoriesCompart';
import TagsCompart from './TagsCompart';
import { SubMenu } from '../SubMenu/SubMenu';
import { useFileManager } from '../Funciones/Funcions';
import { BsFolderFill, BsFilePdf, BsImage, BsTrash, BsStar, BsStarFill } from 'react-icons/bs';

const MyFileCompart = () => {

  const{
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
    getFilteredItems
  } = useFileManager();
  

  return (
    <>
      <div className="top-bar">
        <DocumentosCompart 
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
        <button className="top-button active">Archivos Compartidos</button>
        <CategoriesCompart />
        <TagsCompart />
      </div>

      <div className="content">
        <h1>Archivos Compartidos {currentFolder && (
          <button className="btn btn-sm btn-outline-secondary ms-3" onClick={goBack}>
            Volver
          </button>
        )}</h1>
        
        <SubMenu 
          onFileUpload={handleFileUpload} 
          onCreateFolder={handleCreateFolder} 
        />
        
        <div className="uploaded-files-container mt-3">
          {getFilteredItems().length > 0 ? (
            getFilteredItems().map(item => (
              <div key={item.id} className="uploaded-file mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {item.type === 'folder' ? (
                      <button 
                        className="btn btn-sm me-2 p-0"
                        onClick={() => enterFolder(item.id)}
                      >
                        <BsFolderFill size={24} color="#4e73df" />
                      </button>
                    ) : item.fileType === 'pdf' ? (
                      <BsFilePdf size={24} color="#e74a3b" className="me-3" />
                    ) : (
                      <img 
                        src={URL.createObjectURL(item.fileObject)} 
                        alt="Preview" 
                        className="file-preview-img"
                      />
                    )}
                    
                    <div>
                      <h5 className="mb-1">{item.name}</h5>
                      <div className="file-details">
                        <span>{item.type === 'file' ? item.size : 'Carpeta'}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    {item.type === 'file' && (
                      <button 
                        className="btn btn-sm favorite-btn"
                        onClick={() => toggleFavorite(item.id)}
                        title={favorites.includes(item.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        {favorites.includes(item.id) ? <BsStarFill color="gold" /> : <BsStar />}
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <BsTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted">
              {currentFolder ? 
                'La carpeta está vacía. Sube archivos aquí.' : 
                currentFilter === 'favorites' 
                  ? 'No tienes documentos marcados como favoritos' 
                  : 'No hay elementos. Sube archivos o crea carpetas.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyFileCompart;