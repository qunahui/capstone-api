const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const sendoOrderController = require("../controllers/sendoOrder");
const sendoOrder = require("../models/sendoOrder");

router.get("/", sendoOrderController.getAllSendoOrder);

// test route
// router.get("/unpopulatedProducts", async (req, res) => {
//   try {
//     const products = await Product.find({});

//     res.send(products);
//   } catch (e) {
//     res.status(500).send(e.message);
//   }
// });

//router.get("/:id", sendoOrderController.getSendoOrderById);

router.post("/create-sendo-order", sendoOrderController.createSendoOrder);

//router.patch("/:id", sendoOrderController.updateSendoOrder);

//router.delete("/:id", sendoOrderController.deleteSendoOrder);

module.exports = router;
