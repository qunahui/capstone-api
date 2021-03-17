const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/customer");

// router.post("/sign-in", controller.signIn);

router.get("/:_id", auth, controller.getCustomerById);

router.get("/", auth, controller.getAllCustomer);

router.post("/", auth, controller.createCustomer);

// router.get("/sign-out", auth, controller.signOut);

// router.post("/logout-all", auth, controller.signOutAll);

// // router.post("/sign-up", controller.signUp);

// router.patch("/update", auth, controller.editProfile);


// router.delete("/delete", auth, controller.deleteProfile);

module.exports = router;
