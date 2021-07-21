const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/storage");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", controller.getStorages);

router.get('/activities', controller.getActivities)

router.patch("/add-sendo-credentials", controller.addSendoCredentials);

router.get("/refresh-all", controller.refreshAllToken)

router.post("/disconnect", controller.disconnectStore)

router.get("/fetch-shops", controller.fetchShops);

module.exports = router;
