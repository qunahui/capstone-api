const express = require("express");
const request = require("request-promise");
const cors = require("cors");
const path = require('path');
const Inventory = require('./apis/models/inventory')
const ImportOrderInfoID = require('./apis/models/importOrderInfoID')
require('dotenv').config()

// const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
// require("./connections/mongodb-local");
require("./connections/mongodb-atlas");
const configRoute = require("./apis/index");

const app = express();
const server = require('http').createServer();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
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

const io = require('socket.io')(server, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

io.on('connection', socket => {
  console.log("Connection created")
})

module.exports.getIO = function(){
  return io;
}

server.listen(5050);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server is up in port + ${port}`);
});

/*
*/