const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const inventoryController = require("../controllers/inventory");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/:id", inventoryController.getAllInventoriesByVariantId)

// router.get("/", inventoryController.getAllPurchaseOrder)

// router.get("/:id", inventoryController.getPurchaseOrderById)

// router.post("/", inventoryController.createPurchaseOrder)

// router.post("/payment/:_id", inventoryController.updatePurchasePayment)

module.exports = router;
