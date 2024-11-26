import React, { useState, useEffect, useRef } from 'react';
export default function ChatWindow({ currentUser, selectedUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetch(`http://localhost:5000/messages/${currentUser.id}/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data));
    socket.on('new_message', (message) => {
      if (
        (message.sender_id === currentUser.id && message.receiver_id === selectedUser.id) ||
        (message.sender_id === selectedUser.id && message.receiver_id === currentUser.id)
      ) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [currentUser.id, selectedUser.id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message: newMessage
    };

    fetch('http://localhost:5000/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{selectedUser.username}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender_id === currentUser.id ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.sender_id === currentUser.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {message.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}