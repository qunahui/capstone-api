const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const purchaseOrderController = require("../controllers/purchaseOrder");

router.get("/", auth, purchaseOrderController.getAllPurchaseOrder)

router.get("/:id", auth, purchaseOrderController.getPurchaseOrderById)

router.post("/", auth, purchaseOrderController.createPurchaseOrder)

router.post("/receipt/:_id", auth, purchaseOrderController.createReceipt)

router.post("/payment/:_id", auth, purchaseOrderController.updatePurchasePayment)

module.exports = router;
