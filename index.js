const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store user data in memory (in a real application, use a database)
let users = {};
let messageHistory = []; // Array to store message history

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle new user joining
  socket.on('new user', (username) => {
    users[socket.id] = username; // Store username with socket ID
    io.to(socket.id).emit('message history', messageHistory); // Send message history to the new user
    io.emit('user connected', username); // Notify all clients
  });

  // Handle incoming messages
  socket.on('chat message', (msg) => {
    const username = users[socket.id];
    const messageObject = { username, message: msg };
    messageHistory.push(messageObject); // Add message to history
    io.emit('chat message', messageObject); // Broadcast message to everyone with username
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    io.emit('user disconnected', username); // Notify all clients
    delete users[socket.id]; // Remove user from memory
    console.log(`${username} disconnected`);
  });
});

// Periodically fetch all monitors' statuses and emit to clients
const monitorInterval = 300000; // 5 minutes (in milliseconds)
setInterval(async () => {
  const monitorsData = await fetchAllMonitorsStatus();
  if (monitorsData) {
    io.emit('monitor status', monitorsData);
  }
}, monitorInterval);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
