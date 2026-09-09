// signaling-server.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

console.log('🚀 Starting signaling server...');

wss.on('connection', (ws) => {
  console.log('🔗 New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data.type);

      switch (data.type) {
        case 'register':
          clients.set(data.userId, ws);
          ws.userId = data.userId;
          console.log(`👤 User ${data.userId} registered`);
          console.log(`📊 Online users:`, Array.from(clients.keys()));
          
          const onlineUsers = Array.from(clients.keys());
          ws.send(JSON.stringify({
            type: 'online-users',
            users: onlineUsers
          }));
          
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'user-online',
                userId: data.userId
              }));
            }
          });
          break;

        case 'call-user':
          const targetWs = clients.get(data.to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'incoming-call',
              from: data.from,
              signal: data.signal
            }));
            console.log(`📞 Call from ${data.from} to ${data.to}`);
          } else {
            ws.send(JSON.stringify({
              type: 'user-offline',
              userId: data.to
            }));
            console.log(`❌ User ${data.to} is offline`);
          }
          break;

        case 'accept-call':
          const acceptTarget = clients.get(data.to);
          if (acceptTarget && acceptTarget.readyState === WebSocket.OPEN) {
            acceptTarget.send(JSON.stringify({
              type: 'call-accepted',
              from: data.from,
              signal: data.signal
            }));
            console.log(`✅ Call accepted by ${data.from}`);
          }
          break;

        case 'reject-call':
          const rejectTarget = clients.get(data.to);
          if (rejectTarget && rejectTarget.readyState === WebSocket.OPEN) {
            rejectTarget.send(JSON.stringify({
              type: 'call-rejected',
              from: data.from
            }));
            console.log(`❌ Call rejected by ${data.from}`);
          }
          break;

        case 'end-call':
          const endTarget = clients.get(data.to);
          if (endTarget && endTarget.readyState === WebSocket.OPEN) {
            endTarget.send(JSON.stringify({
              type: 'call-ended',
              from: data.from
            }));
          }
          console.log(`🔚 Call ended by ${data.from}`);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`👋 User ${ws.userId} disconnected`);
      console.log(`📊 Remaining users:`, Array.from(clients.keys()));
      
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'user-offline',
            userId: ws.userId
          }));
        }
      });
    }
  });
});

const PORT = process.env.SIGNALING_PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on ws://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
});