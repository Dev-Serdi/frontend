import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';

export const SearchBar = ({ searchTerm, setSearchTerm, loading }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // La búsqueda se maneja automáticamente con el efecto
    }
  };

  return (
    <div className="input-group mb-4">
      <input
        type="text"
        className="form-control form-control-lg"
        placeholder="Buscar por nombre, email o username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <div className="input-group-append">
        <button 
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <FaSearch className="mr-2" />
          )}
          Buscar
        </button>
      </div>
    </div>
  );
};

export default SearchBar;