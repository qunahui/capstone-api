const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendoProduct");
const util = require('util')

//router.post("/create-ping", controller.createSendoProductByPing);
router.get('/products', controller.getAllProducts)

router.get('/products/fetch-without-auth', controller.fetchWithoutAuth)

router.post('/products/fetch', auth, controller.fetchProducts)

router.post('/products/push', auth, controller.pushProducts)

router.post('/products/sync', auth, controller.syncProducts)

router.post('/product', controller.createProduct)

router.get('/product/:id', controller.getProductById)

module.exports = router;