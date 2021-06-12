const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/report");

router.get("/", auth, controller.getSalesReport);


module.exports = router;