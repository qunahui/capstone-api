const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const productController = require("../controllers/product");
const Product = require("../models/product");

router.get("/check-sku", auth, productController.checkSku);

router.get("/", auth, productController.getAllProduct);

router.get("/:id", auth, productController.getMMSProductById);

router.post("/", auth, productController.createMMSProduct);

router.patch("/:id", auth, productController.updateProduct);

router.delete("/:id", auth, productController.deleteProduct);

router.post('/create-multi-platform', auth, productController.createMultiPlatform)

module.exports = router;
