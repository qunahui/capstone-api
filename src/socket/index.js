const socketIoServer = require('http').createServer();
const port = process.env.SOCKET_PORT || 5050;

function configSocket() {
  const io = require('socket.io')(socketIoServer, {
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  });

  //hook up connection for socket.io
  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  socketIoServer.listen(port, () => {
    console.log(`[Socket.io] Started on port : ${port}`)
  });

  io.on('connection', client => {
    // socket.handshake.headers
    console.log(`socket.io connected: ${socket.id}`);
    // save socket.io socket in the session
    console.log("session at socket.io connection:\n", client.request.session);
    client.request.session.socketio = client.id;
    client.request.session.save();
    
    client.on('disconnect', function(){
      console.log('user disconnected');
    });
  })
}

module.exports = configSocket