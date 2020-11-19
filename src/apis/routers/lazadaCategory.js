const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const lazadaCategoryController = require("../controllers/lazadaCategory");


router.post("/", lazadaCategoryController.getCategoryById);
// router.get("/attribute/:id", categoryController.getAttributeByCategoryId) //categoryId level 4

router.post("/create-lazada-category", lazadaCategoryController.createLazadaCategory) // just for dev, not for user

module.exports = router;