const express = require("express");
const router = express.Router();
const ProductDetail = require("../models/productDetail");
const auth = require("../../middlewares/auth");
const controller = require("../controllers/productDetail");

router.get(
  "/:productID/product-details",
  controller.getAllProductDetailsByProductID
);

router.get("/:productID/product-details/:id", controller.getProductDetailByID);

router.post(
  "/:productID/product-details/create-product-detail",
  controller.editProductDetail
);

module.exports = router;
