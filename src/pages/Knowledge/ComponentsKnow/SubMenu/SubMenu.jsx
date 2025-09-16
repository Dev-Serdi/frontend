import { 
  BsCheck2Square,
  BsPlusSquare,
  BsUpload,
  BsListCheck,
  BsFolderPlus
} from "react-icons/bs";

import { useRef, useState } from "react";

export const SubMenu = ({ onFileUpload, onCreateFolder, acceptFileTypes }) => {
  const fileInputRef = useRef(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderModal, setShowFolderModal] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        onFileUpload(file);
      });
    }
  };

  const handleCreateFolderClick = () => {
    setShowFolderModal(true);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
      setNewFolderName("");
      setShowFolderModal(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center gap-3">  
        <button className="btn bg-dark-subtle d-flex align-items-center gap-2">
          <BsCheck2Square /> Select
        </button>

        <button 
          className="btn bg-dark-subtle d-flex align-items-center gap-2"
          onClick={handleCreateFolderClick}
        >
          <BsFolderPlus /> Create
        </button>

        <button 
          className="btn bg-dark-subtle d-flex align-items-center gap-2"
          onClick={handleUploadClick}
        >
          <BsUpload /> Upload
        </button>

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept={acceptFileTypes || "image/*,.pdf"}
          multiple
        />

        <button className="btn bg-dark-subtle d-flex align-items-center gap-2">
          <BsListCheck /> Selected items
        </button>
      </div>

      {/* Modal para crear carpeta */}
      {showFolderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Crear Nueva Carpeta</h5>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowFolderModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateFolder}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubMenu;