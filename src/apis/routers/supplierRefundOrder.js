const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const supplierRefundOrderController = require("../controllers/supplierRefundOrder");

router.get("/", auth, supplierRefundOrderController.getAllSupplierRefundOrder)

router.get("/:id", auth, supplierRefundOrderController.getSupplierRefundOrderById)

router.post("/", auth, supplierRefundOrderController.createSupplierRefundOrder)

// router.post("/init", auth, supplierRefundOrderController.createInitialSupplierRefundOrder)

router.get("/cancel/:_id", auth, supplierRefundOrderController.cancelSupplierRefundOrder)

router.post("/receipt/:_id", auth, supplierRefundOrderController.createReceipt)

router.post("/payment/:_id", auth, supplierRefundOrderController.updateRefundPayment)

module.exports = router;
