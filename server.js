// server.js

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

let waiting = null;

server.on('connection', (ws) => {
  console.log('New client connected');

  if (waiting) {
    // Pair this client with the waiting client
    const peer = waiting;
    ws.peer = peer;
    peer.peer = ws;

    // Notify both clients that they are matched
    ws.send(JSON.stringify({ type: 'matched', initiator: true }));
    peer.send(JSON.stringify({ type: 'matched', initiator: false }));

    waiting = null;
  } else {
    // No client waiting, so this client waits
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
