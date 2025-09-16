import React from 'react';
import { FaUser } from 'react-icons/fa';
import UserListItem from './UserListItem';

const UserList = ({ loading, error, filteredUsers, searchTerm }) => {
  if (loading || error || filteredUsers.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="list-group">
        {filteredUsers.map((user) => (
          <UserListItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UserList;