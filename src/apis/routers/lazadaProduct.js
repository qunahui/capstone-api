const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaProduct");
const lazadaProduct = require("../models/lazadaProduct");

router.get('/products', auth, controller.getAllProducts);
router.post("/create", auth, controller.createLazadaProduct);

router.post('/products/fetch',auth, controller.fetchProducts)

module.exports = router;