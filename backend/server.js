// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  // ⭐ Add ping timeout to keep connections alive
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store active users and their sockets
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ⭐ Register user with better handling
  socket.on('register-user', (userId) => {
    // Check if user already exists with different socket
    if (users.has(userId)) {
      const oldSocketId = users.get(userId);
      if (oldSocketId !== socket.id) {
        // Disconnect old socket
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket && oldSocket.connected) {
          oldSocket.disconnect(true);
        }
      }
    }
    
    users.set(userId, socket.id);
    socket.userId = userId;
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    console.log(`📊 Online users:`, Array.from(users.keys()));
    
    // Send online users list
    const onlineUsers = Array.from(users.keys());
    socket.emit('online-users', onlineUsers);
    socket.broadcast.emit('user-online', userId);
  });

  // ⭐ Unregister user (clean disconnect)
  socket.on('unregister-user', (userId) => {
    if (users.has(userId) && users.get(userId) === socket.id) {
      users.delete(userId);
      socket.userId = null;
      console.log(`👋 User ${userId} unregistered`);
      socket.broadcast.emit('user-offline', userId);
    }
  });

  // Initiate call
  socket.on('call-user', ({ from, to, signalData }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket && targetSocket.connected) {
        io.to(targetSocketId).emit('incoming-call', {
          from,
          signal: signalData,
          caller: from
        });
        console.log(`📞 Call from ${from} to ${to}`);
      } else {
        // Target socket disconnected, remove from users
        users.delete(to);
        socket.emit('user-offline', to);
        console.log(`❌ User ${to} is offline`);
      }
    } else {
      socket.emit('user-offline', to);
      console.log(`❌ User ${to} not found`);
    }
  });

  // Accept call
  socket.on('accept-call', ({ to, signalData }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-accepted', {
        signal: signalData,
        from: socket.userId
      });
      console.log(`✅ Call accepted by ${socket.userId} for ${to}`);
    }
  });

  // Reject call
  socket.on('reject-call', ({ to }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-rejected', {
        from: socket.userId
      });
      console.log(`❌ Call rejected by ${socket.userId} for ${to}`);
    }
  });

  // End call
  socket.on('end-call', ({ to }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended', {
        from: socket.userId
      });
    }
    socket.emit('call-ended', { from: to });
    console.log(`🔚 Call ended between ${socket.userId} and ${to}`);
  });

  // ⭐ Handle disconnect with better cleanup
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Only remove if the socket is still the active one for this user
      const currentSocketId = users.get(socket.userId);
      if (currentSocketId === socket.id) {
        users.delete(socket.userId);
        socket.broadcast.emit('user-offline', socket.userId);
        console.log(`❌ User ${socket.userId} disconnected`);
        console.log(`📊 Remaining users:`, Array.from(users.keys()));
      }
    }
  });

  // ⭐ Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// ⭐ Monitor server status
setInterval(() => {
  console.log(`📊 Current online users:`, Array.from(users.keys()));
}, 30000); // Log every 30 seconds

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
});