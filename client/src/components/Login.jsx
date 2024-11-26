
import React, { useState, useEffect } from 'react';

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    fetch('http://localhost:5000/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

   
    const existingUser = users.find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      onLogin(existingUser);
    } else {
     
      fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      })
        .then(res => res.json())
        .then(newUser => {
          onLogin(newUser);
        })
        .catch(err => console.error('Error creating user:', err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Chat App Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter your username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Username"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Join Chat
          </button>
        </form>

        {users.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Existing Users:</h2>
            <div className="max-h-40 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                >
                  {user.username}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

