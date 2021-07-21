const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/supplier");

// router.post("/sign-in", controller.signIn);
router.use(auth) //all requests to this router will first hit this middleware

router.get("/check/:email", controller.checkSupplierExist)

router.get("/:_id", controller.getSupplierById);

router.get("/search/", controller.searchSupplier);

router.get("/", controller.getAllSupplier);

router.post("/", controller.createSupplier);

router.patch("/:_id", controller.updateSupplier);

router.delete("/:_id", controller.deleteSupplier);

module.exports = router;
