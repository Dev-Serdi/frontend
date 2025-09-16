import React, { useEffect, useState } from 'react';
import { listUsers } from '../../services/UsuarioService';
import { Spinner } from 'react-bootstrap';
import SearchBar from '../Knowledge/ComponentsKnow/People_Components/SearchBar';
import UserList from '../Knowledge/ComponentsKnow/People_Components/UserList';
import StatusMessages from './../Knowledge/ComponentsKnow/People_Components/StatusMessages';
import CardLayout from './ComponentsKnow/People_Components/CardLayout';

const People = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuth = localStorage.getItem("authToken");

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listUsers();
        setUsuarios(response.data || []);
        setFilteredUsers(response.data || []);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError("Error al cargar los usuarios. Por favor intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuth) {
      fetchUsers();
    } else {
      setError("Debes iniciar sesión para ver esta información");
    }
  }, [isAuth]);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(usuarios);
    } else {
      const filtered = usuarios.filter(user =>
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, usuarios]);

  return (
    <CardLayout title="Gestión de Personas">
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loading={loading}
      />
      
      <StatusMessages 
        loading={loading}
        error={error}
        isAuth={isAuth}
        searchTerm={searchTerm}
        filteredUsers={filteredUsers}
      />
      
      <UserList 
        loading={loading}
        error={error}
        filteredUsers={filteredUsers}
        searchTerm={searchTerm}
      />
    </CardLayout>
  );
};

export default People;