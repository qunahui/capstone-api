const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/report");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", controller.getSalesReport);
router.get("/purchase", controller.getPurchaseReport);

module.exports = router;