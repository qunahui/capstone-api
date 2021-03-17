const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/lazadaOrder");

router.get("/", controller.getAllLazadaOrder);
router.get("/:orderNumber", controller.getLazadaOrderById);

router.post("/create-order-ping", controller.createLazadaOrderByPing);
router.post("/create-order-sync-sendo", controller.createLazadaOrderBySyncSendo);
router.post("/create-order-sync-lazada", controller.createLazadaOrderBySyncLazada);
//router.post("/create-order", controller.createOrderByPing);
//router.patch("/:id", controller.updateSendoOrder); update what? 

//router.delete("/:id", controller.deleteSendoOrder); isDelete=true?

module.exports = router;
