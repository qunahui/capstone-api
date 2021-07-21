const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const productController = require("../controllers/product");
const Product = require("../models/product");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/check-sku", productController.checkSku);

router.get("/", productController.getAllProduct);

router.get("/:_id", productController.getMMSProductById);

router.post("/", productController.createMMSProduct);

router.post('/create-multi-platform', productController.createMultiPlatform)

router.patch("/:_id", productController.updateProduct);

router.delete("/:_id", productController.deleteProduct);

module.exports = router;
