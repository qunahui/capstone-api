const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/category");


router.get("/", auth, controller.getListCategory);

// router.get("/", auth, controller.getListCategory);

// router.post("/create-lazada-category", controller.createCategory) // just for dev, not for user

module.exports = router;