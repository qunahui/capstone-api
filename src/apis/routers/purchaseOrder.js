const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const purchaseOrderController = require("../controllers/purchaseOrder");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", purchaseOrderController.getAllPurchaseOrder)

router.get("/:_id", purchaseOrderController.getPurchaseOrderById)

router.post("/", purchaseOrderController.createPurchaseOrder)

router.post("/init", purchaseOrderController.createInitialPurchaseOrder)

router.get("/cancel/:_id", purchaseOrderController.cancelPurchaseOrder)

router.post("/receipt/:_id", purchaseOrderController.createReceipt)

router.post("/payment/:_id", purchaseOrderController.updatePurchasePayment)

module.exports = router;
