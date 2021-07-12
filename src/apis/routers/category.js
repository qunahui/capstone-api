const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/category");
const Category = require("../models/category");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", controller.getListCategory);

router.get("/search", controller.searchCategory)

router.post("/", controller.createCategory);

router.patch("/:id", controller.updateCategory);

router.delete("/:id", controller.deleteCategory);

// router.get("/:id", controller.getCategoryById);
// router.post("/create-lazada-category", controller.createCategory) // just for dev, not for user
// router.get("/all", controller.all) //comment route getCategoryById first
// router.get("/playground", controller.playGround) //comment route getCategoryById first
// router.get('/add-fuzzy', controller.addFuzzy) //comment route getCategoryById first
module.exports = router;