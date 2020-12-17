const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const sendoOrderController = require("../controllers/sendoOrder");
const sendoOrder = require("../models/sendoOrder");

router.get("/", sendoOrderController.getAllSendoOrder);
router.get("/:orderNumber", sendoOrderController.getSendoOrderById);

router.post("/create-order", sendoOrderController.createSendoOrder);

//router.patch("/:id", sendoOrderController.updateSendoOrder); update what? 

//router.delete("/:id", sendoOrderController.deleteSendoOrder); isDelete=true?

module.exports = router;
