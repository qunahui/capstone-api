const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendoProduct");



router.post("/create-ping", controller.createSendoProductByPing);
router.post("/create-sync", controller.createSendoProductBySync);

module.exports = router;