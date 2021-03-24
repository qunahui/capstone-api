const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const SendoVariant = require("../models/sendoVariant")
// const variantController = require("../controllers/variant");


// router.get("/", auth, async (req, res) => {
    
// });

// router.get("/:id", auth, variantController.getMMSVariantById);

// router.post("/", auth, variantController.createMMSVariant);

// router.post("/link", auth, variantController.linkVariant);

// router.patch("/:id", auth, variantController.updateVariant);

// router.delete("/:id", auth, variantController.deleteVariant);

module.exports = router;
