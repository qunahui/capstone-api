const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaCategory");


router.post("/", controller.getListCategory);

router.post("/create-lazada-category", controller.createLazadaCategory) // just for dev, not for user

module.exports = router;