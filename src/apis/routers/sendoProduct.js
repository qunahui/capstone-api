const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendoProduct");

//router.post("/create-ping", controller.createSendoProductByPing);
router.get('/products', controller.getAllProducts)
router.post('/products/fetch', auth, controller.fetchProducts)
module.exports = router;