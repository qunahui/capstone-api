const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/Category");


router.post("/", auth,controller.getListCategory)
router.post("/create-category-tree", auth, controller.createCategoryTree) // just for dev, not for user
router.get("/", auth, controller.searchCategory)

module.exports = router;