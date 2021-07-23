const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const supplierRefundOrderController = require("../controllers/supplierRefundOrder");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", supplierRefundOrderController.getAllSupplierRefundOrder)

router.get("/:_id", supplierRefundOrderController.getSupplierRefundOrderById)

router.post("/", supplierRefundOrderController.createSupplierRefundOrder)

router.get("/cancel/:_id", supplierRefundOrderController.cancelSupplierRefundOrder)

router.post("/receipt/:_id", supplierRefundOrderController.createReceipt)

router.post("/payment/:_id", supplierRefundOrderController.updateRefundPayment)

// router.post("/init", auth, supplierRefundOrderController.createInitialSupplierRefundOrder)

module.exports = router;
