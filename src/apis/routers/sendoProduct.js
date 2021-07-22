const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendoProduct");
const util = require('util')

router.use(auth) //all requests to this router will first hit this middleware

router.get('/', controller.getAllProducts)

router.post('/fetch', controller.fetchProducts)

router.post('/push', controller.pushProducts)

router.post('/sync', controller.syncProducts)

router.get('/:_id', controller.getProductById)

router.delete('/:_id', controller.deleteProduct)

//chưa có route update sendoproduct

//router.post('/', controller.createProduct)
//router.get('/products/fetch-without-auth', controller.fetchWithoutAuth)
//router.post("/create-ping", controller.createSendoProductByPing);

module.exports = router;