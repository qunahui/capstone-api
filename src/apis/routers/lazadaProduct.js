const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaProduct");
const lazadaProduct = require("../models/lazadaProduct");


router.post("/create", controller.createLazadaProduct);


module.exports = router;