const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const variantController = require("../controllers/variant");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", variantController.getAllVariant);

router.get("/:_id", variantController.getMMSVariantById);

router.post("/", variantController.createMMSVariant);

router.post("/auto-link", variantController.autoLinkVariant);

router.post("/link", variantController.linkVariant);

router.post("/unlink", variantController.unlinkVariant);

router.post("/push-api", variantController.pushUpdatedToApi);

router.patch("/:id", variantController.updateVariant);

router.delete("/:_id", variantController.deleteVariant);

module.exports = router;
