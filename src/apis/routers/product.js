const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const productController = require("../controllers/product");
const Product = require("../models/product");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/check-sku", productController.checkSku);

router.get("/", productController.getAllProduct);

router.get("/:id", productController.getMMSProductById);

router.post("/", productController.createMMSProduct);

router.patch("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

router.post('/create-multi-platform', productController.createMultiPlatform)

module.exports = router;
