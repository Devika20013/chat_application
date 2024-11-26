import React, { useState, useEffect } from 'react';

export default function UserList({ currentUserId, onSelectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/users')
      .then(res => res.json())
      .then(data => {
        const filteredUsers = data.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      });
  }, [currentUserId]);

  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Users</h2>
      </div>
      <div className="overflow-y-auto">
        {users.map(user => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="p-4 hover:bg-gray-100 cursor-pointer"
          >
            <div className="font-medium">{user.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
