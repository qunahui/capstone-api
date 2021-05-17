const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const refundOrderController = require("../controllers/refundOrder");

router.get("/", auth, refundOrderController.getAllRefundOrder)

router.get("/:id", auth, refundOrderController.getRefundOrderById)

router.post("/", auth, refundOrderController.createRefundOrder)

// router.post("/init", auth, refundOrderController.createInitialRefundOrder)

router.get("/cancel/:_id", auth, refundOrderController.cancelRefundOrder)

router.post("/receipt/:_id", auth, refundOrderController.createReceipt)

router.post("/payment/:_id", auth, refundOrderController.updateRefundPayment)

module.exports = router;
