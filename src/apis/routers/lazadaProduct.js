const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaProduct");

router.use(auth) //all requests to this router will first hit this middleware

router.get('/', controller.getAllProducts);

router.get("/:_id", controller.getProductById);

router.post('/fetch', controller.fetchProducts)

router.post('/fetch-deleted', controller.fetchDeletedProducts)

router.post('/sync', controller.syncProducts)

//chưa có route delete lazada product

//chưa có route update lazada product

//router.post("/", controller.createProduct);

//router.post('/push', async (req, res) => { res.sendStatus(200) })

module.exports = router;