const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const inventoryController = require("../controllers/inventory");

router.get("/:id", auth, inventoryController.getAllInventoriesByVariantId)

// router.get("/", auth, inventoryController.getAllPurchaseOrder)

// router.get("/:id", auth, inventoryController.getPurchaseOrderById)

// router.post("/", auth, inventoryController.createPurchaseOrder)

// router.post("/payment/:_id", auth, inventoryController.updatePurchasePayment)

module.exports = router;
