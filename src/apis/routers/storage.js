const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/storage");

router.post("/get-storages", auth, controller.getStorages);

router.patch("/add-platform-credentials", auth, controller.addPlatformCredentials);

router.get("/fetch-shops", auth, controller.fetchShops);

module.exports = router;
