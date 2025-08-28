import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const DocumentsReposi = ({ currentFilter, setCurrentFilter }) => {
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
          className={`dropdown-item ${currentFilter === 'recent' ? 'active' : ''}`}
          onClick={() => handleFilterSelect('recent')}
        >
          Modificados por mi
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

export default DocumentsReposi;