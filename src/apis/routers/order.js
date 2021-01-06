const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/order");
const order = require("../models/order");

router.get("/", controller.getAllOrder);
router.get("/:orderNumber", controller.getOrderById);

router.post("/create-order-ping", controller.createOrderByPing);
router.post("/create-order-sync-sendo", controller.createOrderBySyncSendo);
router.post("/create-order-sync-lazada", controller.createOrderBySyncLazada);
//router.post("/create-order", controller.createOrderByPing);
//router.patch("/:id", controller.updateSendoOrder); update what? 

//router.delete("/:id", controller.deleteSendoOrder); isDelete=true?

module.exports = router;
