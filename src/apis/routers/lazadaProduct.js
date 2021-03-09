const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaProduct");
const lazadaProduct = require("../models/lazadaProduct");

<<<<<<< Updated upstream

router.post("/create", controller.createLazadaProduct);
=======
router.get('/products', auth, controller.getAllProducts);
router.post("/create", auth, controller.createLazadaProduct);
>>>>>>> Stashed changes


router.post('/products/fetch',auth, controller.fetchProducts)

module.exports = router;