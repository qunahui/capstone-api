const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaProduct");

router.get('/products', auth, controller.getAllProducts);
router.post("/create", auth, controller.createLazadaProduct);

router.get('/products/fetch-no-auth', controller.fetchProductsWithoutAuth)

router.post('/products/fetch', auth, controller.fetchProducts)

router.post('/products/fetch-deleted', auth, controller.fetchDeletedProducts)

router.post('/products/push', auth, async (req, res) => { res.sendStatus(200) })

router.post('/products/sync', auth, controller.syncProducts)

router.post("/product", controller.createProduct);

router.get("/product/:id", controller.getProductById);

module.exports = router;