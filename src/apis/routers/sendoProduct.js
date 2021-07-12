const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendoProduct");
const util = require('util')

router.use(auth) //all requests to this router will first hit this middleware

router.get('/products', controller.getAllProducts)

router.post('/products/fetch', controller.fetchProducts)

router.post('/products/push', controller.pushProducts)

router.post('/products/sync', controller.syncProducts)

router.post('/product', controller.createProduct)

router.get('/product/:id', controller.getProductById)

router.get("/categories", controller.getSendoListCategory);

router.get("/categories/search", controller.searchSendoCategory);

router.post("/suggest-category", controller.getSuggestCategory);

//router.get('/products/fetch-without-auth', controller.fetchWithoutAuth)
//router.post("/create-ping", controller.createSendoProductByPing);
module.exports = router;