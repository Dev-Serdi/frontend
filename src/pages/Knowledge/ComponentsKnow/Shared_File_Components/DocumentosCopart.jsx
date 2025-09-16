import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Documents = ({ currentFilter, setCurrentFilter }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterSelect = (filterType) => {
    setCurrentFilter(filterType);
    setShowDropdown(false);
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        className="top-button" 
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
      >
        Documentos 
        {showDropdown ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      
      <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
        <button 
          className={`dropdown-item ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterSelect('all')}
        >
          Todos los documentos
        </button>
        <button 
          className={`dropdown-item ${currentFilter === 'editing' ? 'active' : ''}`}
          onClick={() => handleFilterSelect('editing')}
        >
          Editando actualmente
        </button>
        <button 
          className={`dropdown-item ${currentFilter === 'others-editing' ? 'active' : ''}`}
          onClick={() => handleFilterSelect('others-editing')}
        >
          Otros están editando
        </button>
        <button 
          className={`dropdown-item ${currentFilter === 'recent' ? 'active' : ''}`}
          onClick={() => handleFilterSelect('recent')}
        >
          Modificados recientemente
        </button>
        <button 
          className={`dropdown-item ${currentFilter === 'favorites' ? 'active' : ''}`}
          onClick={() => handleFilterSelect('favorites')}
        >
          Mis favoritos
        </button>
      </div>
    </div>
  );
};

export default Documents;