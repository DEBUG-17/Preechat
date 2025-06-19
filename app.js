// app.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve your HTML
app.use(express.static(path.join(__dirname, '.')));

let waiting = null;

wss.on('connection', (ws) => {
  console.log('New client connected');

  if (waiting) {
    const peer = waiting;
    ws.peer = peer;
    peer.peer = ws;

    ws.send(JSON.stringify({ type: 'matched', initiator: true }));
    peer.send(JSON.stringify({ type: 'matched', initiator: false }));

    waiting = null;
  } else {
    waiting = ws;
  }

  ws.on('message', (message) => {
    if (ws.peer) {
      ws.peer.send(message);
    }
  });

  ws.on('close', () => {
    if (ws.peer) {
      ws.peer.peer = null;
    }
    if (waiting === ws) {
      waiting = null;
    }
  });
});

// Start HTTP & WebSocket on same port
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
