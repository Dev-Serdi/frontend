// C:/react/Proyecto/frontend/src/components/Chat/ChatComponent.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaComments,
  FaPaperPlane,
  FaFileUpload,
  FaSpinner,
  FaExclamationCircle,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import ImagePreview from "./ImagePreview"; // Se mantiene la importación
import { getAuthToken } from "../../services/AuthService";

// --- Helper: Formatear timestamp (sin cambios) ---
const formatChatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn("Timestamp inválido:", timestamp);
      return "Fecha inválida";
    }
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formateando timestamp:", timestamp, e);
    return "Error fecha";
  }
};

// --- Componente principal del Chat ---
const ChatComponent = ({
  messages = [],
  onSendMessage,
  isConnected,
  isConnecting,
  isLoadingMessages,
  currentUserId,
  connectionError,
  closedTicket,
}) => {
  // ... (Todos los estados y manejadores de eventos se mantienen igual)
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
    }
  }, [message]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
  ];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Archivo no soportado: ${file.name}. Permitidos: PNG, JPG, PDF.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo demasiado grande: ${file.name} (Max: 5MB).`;
    }
    return null;
  };

  const handleFileSelect = useCallback((files) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setFileError("");
      return;
    }
    const file = files[0];
    const error = validateFile(file);

    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setFileError("");
      setSelectedFile(file);
    }
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = null;
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !selectedFile) return;

    // Limpiar el textarea inmediatamente al enviar
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSendMessage(trimmedMessage, selectedFile ? [selectedFile] : []);
      setSelectedFile(null);
      setFileError("");
    } catch (error) {
      console.error("Error handled in parent:", error);
    }
  };

  const getPlaceholderText = () => {
    if (closedTicket) return closedTicket;
    if (connectionError) return "Error de conexión...";
    if (isConnecting) return "Conectando al chat...";
    if (!isConnected) return "Chat desconectado. Intentando reconectar...";
    return "Escribe tu mensaje...";
  };

  const isInputDisabled = !isConnected || !!connectionError || isConnecting;
  const isSendButtonDisabled =
    isInputDisabled || (!message.trim() && !selectedFile);

  const handleDownloadAttachment = useCallback(
    async (attachmentUrl, attachmentFilename) => {
      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_BASE_URL; //
      try {
        const response = await fetch(`${baseUrl}${attachmentUrl}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = attachmentFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Fallo en la descarga del adjunto:", error);
      }
    },
    []
  );

  return (
    <div className="flex-1 flex flex-col max-h-[761px] h-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header (sin cambios) */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <FaComments className="text-indigo-600 mr-3 text-xl" />
          <h2 className="text-lg font-semibold text-gray-800">
            Mensajes del Ticket
          </h2>
        </div>
        <div className="flex items-center text-xs">
          {connectionError ? (
            <FaExclamationCircle
              className="text-red-500 mr-1"
              title={`Error: ${connectionError}`}
            />
          ) : isConnecting ? (
            <FaSpinner
              className="animate-spin text-yellow-500 mr-1"
              title="Conectando..."
            />
          ) : isConnected ? (
            <span
              className="w-3 h-3 bg-green-500 rounded-full mr-1"
              title="Conectado"
            ></span>
          ) : (
            <span
              className="w-3 h-3 bg-gray-400 rounded-full mr-1"
              title="Desconectado"
            ></span>
          )}
          <span
            className={`font-medium ${
              connectionError
                ? "text-red-600"
                : isConnecting
                ? "text-yellow-600"
                : isConnected
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            {connectionError
              ? "Error"
              : isConnecting
              ? "Conectando"
              : isConnected
              ? "Conectado"
              : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-3 overflow-y-auto bg-gray-100 space-y-3"
      >
        {isLoadingMessages ? (
          <div className="text-center text-gray-500 py-10">
            <FaSpinner className="animate-spin h-6 w-6 mx-auto mb-2 text-indigo-500" />
            Cargando mensajes...
          </div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.sender?.id === currentUserId;
            const isImageAttachment =
              msg.attachmentUrl &&
              /\.(jpg|jpeg|png|gif)$/i.test(msg.attachmentFilename);
            const fullImageUrl = isImageAttachment
              ? `${import.meta.env.VITE_BASE_URL}${msg.attachmentUrl}`
              : null; //

            return (
              <div
                key={msg.id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] m-1 p-2 px-3 rounded-lg shadow-sm ${
                    isSender
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {!isSender && (
                    <p className="text-xs font-semibold mb-1 text-indigo-700">
                      {msg.sender?.nombre || "Usuario Desconocido"}
                    </p>
                  )}

                  {msg.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}

                  {isImageAttachment ? (
                    <ImagePreview
                      src={fullImageUrl}
                      alt={msg.attachmentFilename}
                      onImageLoad={scrollToBottom}
                    />
                  ) : (
                    msg.attachmentFilename && (
                      <div className="mt-1 p-2 bg-black bg-opacity-10 rounded text-xs flex items-center gap-2">
                        <FaFileUpload className="flex-shrink-0 text-base" />
                        <span className="truncate flex-1">
                          {msg.attachmentFilename}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAttachment(
                              msg.attachmentUrl,
                              msg.attachmentFilename
                            );
                          }}
                          className="p-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                          title={`Descargar ${msg.attachmentFilename}`}
                        >
                          <FaDownload className="text-sm" />
                        </button>
                      </div>
                    )
                  )}

                  <p
                    className={`text-[10px] mt-1 ${
                      isSender ? "text-indigo-100" : "text-gray-400"
                    } text-right`}
                  >
                    {formatChatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Área de Entrada (sin cambios) */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 bg-gray-50"
      >
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between border rounded p-1.5 bg-indigo-50 border-indigo-200">
            <div className="flex items-center gap-2 text-xs text-indigo-800 flex-1 min-w-0">
              <FaFileUpload className="flex-shrink-0 text-indigo-600" />
              <span className="truncate">{selectedFile.name}</span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 font-bold text-lg leading-none p-1 flex-shrink-0"
              aria-label="Eliminar archivo"
            >
              <FaTimes size={12} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div
            className={`relative flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? "border-indigo-500 bg-indigo-100"
                : "border-gray-300 hover:border-indigo-400"
            } ${fileError ? "border-red-500 bg-red-50" : ""} ${
              isInputDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isInputDisabled && fileInputRef.current?.click()}
            role="button"
            tabIndex={isInputDisabled ? -1 : 0}
            aria-label="Adjuntar archivo"
            title={
              fileError
                ? fileError
                : "Adjuntar archivo (PNG, JPG, PDF - Max 5MB)"
            }
          >
            <FaFileUpload
              className={`text-lg ${
                isDragging
                  ? "text-indigo-600"
                  : fileError
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept={ALLOWED_TYPES.join(",")}
              aria-hidden="true"
              disabled={isInputDisabled}
            />
          </div>
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholderText()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none overflow-y-auto text-sm"
            aria-label="Escribir mensaje"
            disabled={isInputDisabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isSendButtonDisabled) {
                  setMessage(""); // Limpiar el textarea inmediatamente
                  if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                  }
                  handleSubmit(e);
                }
              }
            }}
            style={{ minHeight: "40px", height: "40px" }}
          />
          <button
            type="submit"
            disabled={isSendButtonDisabled}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Enviar mensaje"
          >
            <FaPaperPlane className="text-lg" />
          </button>
        </div>
        {fileError && !connectionError && (
          <p className="mt-1 text-xs text-red-600">{fileError}</p>
        )}
        {connectionError && (
          <p className="mt-1 text-xs text-red-600">
            Error de conexión: {connectionError}
          </p>
        )}
        {!fileError && !connectionError && (
          <p className="mt-1 text-xs text-gray-500">
            Arraste el archivo al ícono o haga clic para adjuntar. Archivo: PNG, JPG, PDF (Max 5MB).
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatComponent;
