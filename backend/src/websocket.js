const { Server } = require('socket.io');

let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('WS client connected:', socket.id);
    socket.on('disconnect', () => console.log('WS client disconnected:', socket.id));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { init, getIO };
