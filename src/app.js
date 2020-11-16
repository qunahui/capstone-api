const express = require("express");
const request = require("request");
const cors = require("cors");
// const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
// require("./connections/mongodb-local");
require("./connections/mongodb-atlas");
const configRoute = require("./apis/index");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

app.get("/*", (req, res, next) => {
  console.log("Received request: ", req.body)
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
