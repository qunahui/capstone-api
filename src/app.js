const express = require("express");
const cors = require("cors");
require('dotenv').config()
require("./connections/mongodb-atlas");

process.env.API_URL = process.env.NODE_ENV === 'dev' ? 'http://localhost:5000' : 'https://capstone-api-mms.herokuapp.com'

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();
const port = process.env.PORT || 5000;
const configRoute = require("./apis/index");

app.use(express.json());
app.use(cors());
// hook up session for express routes
// app.use(sessionMiddleware);
// hook up the session for socket.io connections
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get("/*", (req, res, next) => {
  res.set({
    "Access-Control-Expose-Headers": "Content-Range",
    "Content-Range": "1-2*",
    "X-Total-Count": "30",
    "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS"
  });
  next();
});

configRoute(app);
// configSocket();

// app.get('/socket/test', function(req, res) {
//   const session = req.session;
//   io.sockets.connected[session.socketio].emit('show', 'hello');
//   res.json({greeting: "hello"});
// })

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server is up in port + ${port}`);
});

/*
*/