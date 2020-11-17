const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const categoryController = require("../controllers/category");


router.get("/:id", categoryController.getCategoryById);
router.get("/attribute/:id", categoryController.getAttributeByCategoryId) //categoryId level 4

module.exports = router;