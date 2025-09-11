import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { getAuthToken } from '../../services/AuthService';

/**
 * @component ImagePreview
 * @description Obtiene y muestra una vista previa de una imagen desde una URL protegida,
 * gestionando sus propios estados de carga y error.
 * @param {{src: string, alt: string, onImageLoad: () => void}}
 */
const ImagePreview = ({ src, alt, onImageLoad }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // URL local del Blob
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay 'src', no hacemos nada.
    if (!src) {
      setIsLoading(false);
      return;
    }

    // AbortController para cancelar el fetch si el componente se desmonta
    const controller = new AbortController();

    const fetchImage = async () => {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken(); // Obtenemos el token de autenticación

      if (!token) {
        setError("Autenticación requerida.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal // Asociamos el AbortController
        });

        if (!response.ok) {
          throw new Error(`Error al cargar la imagen: ${response.statusText}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error al obtener la imagen:", err);
          setError("No se pudo cargar la imagen.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();

    // Función de limpieza para revocar la URL del objeto y evitar fugas de memoria
    return () => {
      controller.abort(); // Cancelamos el fetch si está en curso
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src]); // Se ejecuta cada vez que la prop 'src' cambia

  const openModal = (e) => {
    e.stopPropagation();
    if (imageUrl) setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  if (isLoading) {
    return (
      <div className="mt-2 flex items-center justify-center h-24 w-32 bg-gray-200 rounded-lg">
        <FaSpinner className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 p-2 flex flex-col items-center text-xs text-red-600 bg-red-50 rounded-lg">
        <FaExclamationTriangle className="mb-1" />
        {error}
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <>
      <div className="mt-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={openModal}>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-xs max-h-48 rounded-lg object-cover border border-gray-200"
          onLoad={onImageLoad}
          title={`Ver imagen: ${alt}`}
        />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt={alt} className="w-full h-full object-contain rounded-lg" />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
              aria-label="Cerrar imagen"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;