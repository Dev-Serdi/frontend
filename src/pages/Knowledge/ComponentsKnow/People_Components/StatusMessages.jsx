import React from 'react';
import { Spinner } from 'react-bootstrap';

const StatusMessages = ({ loading, error, isAuth, searchTerm, filteredUsers }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        {isAuth && (
          <button 
            className="btn btn-sm btn-link"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (!loading && !error && filteredUsers.length === 0) {
    return (
      <div className="alert alert-info">
        No se encontraron usuarios {searchTerm ? `para "${searchTerm}"` : ''}
      </div>
    );
  }

  return null;
};

export default StatusMessages;