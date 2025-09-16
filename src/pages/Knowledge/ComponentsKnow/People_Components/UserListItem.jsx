import React from 'react';
import { FaUser } from 'react-icons/fa';

const UserListItem = ({ user }) => {
  return (
    <div className="list-group-item list-group-item-action">
      <div className="d-flex align-items-center">
        <div className="mr-3">
          <FaUser size={24} className="text-primary" />
        </div>
        <div className="flex-grow-1">
          <h5 className="mb-1">{user.nombre + " " + user.apellido}</h5>
          <p className="mb-1 small text-muted">{user.email}</p>
        </div>
        <div className="text-right">
          <small className="text-muted">ID: {user.id}</small>
        </div>
      </div>
    </div>
  );
};

export default UserListItem;