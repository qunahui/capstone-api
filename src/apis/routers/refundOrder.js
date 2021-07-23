const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const refundOrderController = require("../controllers/refundOrder");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", refundOrderController.getAllRefundOrder)

router.get("/:_id", refundOrderController.getRefundOrderById)

router.post("/", refundOrderController.createRefundOrder)

router.get("/cancel/:_id", refundOrderController.cancelRefundOrder)

router.post("/receipt/:_id", refundOrderController.createReceipt)

router.post("/payment/:_id", refundOrderController.updateRefundPayment)

// router.post("/init", refundOrderController.createInitialRefundOrder)

module.exports = router;
