const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/Category");


router.post("/", controller.getListCategory)
router.post("/create-category-tree", controller.createCategoryTree) // just for dev, not for user
router.get("/", controller.searchCategory)

module.exports = router;