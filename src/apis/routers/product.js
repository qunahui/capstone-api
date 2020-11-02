const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const productController = require("../controllers/product");
const Product = require("../models/product");

router.get("/", productController.getAllProduct);

// test route
router.get("/unpopulatedProducts", async (req, res) => {
  try {
    const products = await Product.find({});

    res.send(products);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/:id", productController.getProductById);

router.post("/create-product", productController.createProduct);

router.patch("/:id", productController.editProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;
