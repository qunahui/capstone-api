const express = require("express");
const request = require("request");
const cors = require("cors");
const path = require('path');
const { signRequest } = require('./sign-request')
require('dotenv').config()

// const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
// require("./connections/mongodb-local");
require("./connections/mongodb-atlas");
const configRoute = require("./apis/index");
const { sign } = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const now = Date.now()
const lazSign = signRequest('JPqQSDANG14eZdPtMogRDjiNwGYGj8wz', '/auth/token/create', {
  app_key: 122845,
  timestamp: now,
  sign_method: 'sha256',
  code: '0_122845_R9u5c1WlGHXrUz5L2xg4f1re64769',
  //....other params
})
console.log(now)
console.log(lazSign)

// app.get('/laz', (req, res) => {
//   console.log(req)
// })

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

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server is up in port + ${port} 🐳`);
});

/*
*/