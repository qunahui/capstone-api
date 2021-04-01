const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const variantController = require("../controllers/variant");


router.get("/", auth, variantController.getAllVariant);

router.get("/:id", auth, variantController.getMMSVariantById);

router.post("/", auth, variantController.createMMSVariant);

router.post("/link", auth, variantController.linkVariant);

router.post("/unlink", auth, variantController.unlinkVariant);

router.post("/push-api", auth, variantController.pushUpdatedToApi);

router.patch("/:id", auth, variantController.updateVariant);

router.delete("/:id", auth, variantController.deleteVariant);

module.exports = router;
