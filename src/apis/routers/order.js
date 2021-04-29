const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const orderController = require("../controllers/order");
const RefundOrder = require("../models/order")

router.get("/", auth, orderController.getAllOrder)

router.get("/:id", auth, orderController.getOrderById)

router.post("/", auth, orderController.createOrder)

router.post("/lazada", auth, orderController.createLazadaOrder)

router.post("/sendo", auth, orderController.createSendoOrder)

router.get("/cancel/:_id", auth, orderController.cancelOrder)

router.post("/pack/:_id", auth, orderController.createPackaging)

router.post("/receipt/:_id", auth, orderController.createReceipt)

router.post("/payment/:_id", auth, orderController.updatePayment)

module.exports = router;
