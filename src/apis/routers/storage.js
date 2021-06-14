const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/storage");

router.get("/", auth, controller.getStorages);

router.get('/activities', auth, controller.getActivities)

router.patch("/add-sendo-credentials", auth, controller.addSendoCredentials);

router.get("/refresh-all", auth, controller.refreshAllToken)

router.post("/disconnect", auth, controller.disconnectStore)

router.get("/fetch-shops", auth, controller.fetchShops);

module.exports = router;
