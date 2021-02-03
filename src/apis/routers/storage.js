const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/storage");

router.get("/", auth, controller.getStorages);

router.patch("/add-sendo-credentials", auth, controller.addSendoCredentials);

router.get("/fetch-shops", auth, controller.fetchShops);

module.exports = router;
