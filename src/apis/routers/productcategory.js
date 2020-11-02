const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/productcategory");

router.get("/", controller.getAllProductCategories);

router.get("/:id", controller.getProductCategoryById);

router.post("/create-product-category", controller.editProductCategory);

module.exports = router;
