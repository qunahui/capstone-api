const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaProduct");

router.use(auth) //all requests to this router will first hit this middleware

router.get('/products', controller.getAllProducts);

router.post("/create", controller.createLazadaProduct);

router.post('/products/fetch', controller.fetchProducts)

router.post('/products/fetch-deleted', controller.fetchDeletedProducts)

router.post('/products/sync', controller.syncProducts)

router.post("/product", controller.createProduct);

router.get("/product/:id", controller.getProductById);

//router.post('/products/push', async (req, res) => { res.sendStatus(200) })

module.exports = router;