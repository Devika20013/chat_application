
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chatapp',
  password: 'SiriDevi91',
  port: 5432,
});

app.use(cors());
app.use(express.json());
app.get('/messages/:userId/:receiverId', async (req, res) => {
  const { userId, receiverId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2)
       OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY timestamp ASC`,
      [userId, receiverId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/messages', async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [sender_id, receiver_id, message]
    );
    const newMessage = result.rows[0];
    io.to(`user_${sender_id}`).to(`user_${receiver_id}`).emit('new_message', newMessage);
    res.json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/users', async (req, res) => {
    const { username } = req.body;
    try {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
        [username]
      );
  
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
     
      const result = await pool.query(
        'INSERT INTO users (username) VALUES ($1) RETURNING *',
        [username]
      );
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});