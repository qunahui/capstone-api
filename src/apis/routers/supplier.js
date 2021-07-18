const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/supplier");

// router.post("/sign-in", controller.signIn);

router.get("/check/:email", auth, controller.checkSupplierExist)

router.get("/id/:_id", auth, controller.getSupplierById);

router.get("/search/", auth, controller.searchSupplier);

router.get("/", auth, controller.getAllSupplier);

router.post("/", auth, controller.createSupplier);

router.patch("/update/:_id", auth, controller.updateSupplier);

router.delete("/delete/:_id", auth, controller.deleteSupplier);


// router.get("/sign-out", auth, controller.signOut);

// router.post("/logout-all", auth, controller.signOutAll);

// // router.post("/sign-up", controller.signUp);

// router.patch("/update", auth, controller.editProfile);


// router.delete("/delete", auth, controller.deleteProfile);

module.exports = router;
