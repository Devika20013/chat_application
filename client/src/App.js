
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';

const socket = io('http://localhost:5000');

export default function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (currentUser) {
      socket.emit('join_user', currentUser.id);
    }

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSelectedUser(null);
    socket.disconnect();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Chat App</h1>
          <div className="flex items-center gap-4">
            <span>Logged in as: {currentUser.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 w-full max-w-screen-xl mx-auto">
        <div className="w-1/4 bg-black border-r text-white">
          <UserList
            currentUserId={currentUser.id}
            onSelectUser={setSelectedUser}
          />
        </div>
        <div className="w-3/4">
          {selectedUser ? (
            <ChatWindow
              currentUser={currentUser}
              selectedUser={selectedUser}
              socket={socket}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
