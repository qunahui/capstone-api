const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/customer");

// router.post("/sign-in", controller.signIn);

router.get("/check/:email", auth, controller.checkCustomerExist)

router.get("/id/:_id", auth, controller.getCustomerById);

router.get("/search/", auth, controller.searchCustomer);

router.get("/", auth, controller.getAllCustomer);

router.post("/", auth, controller.createCustomer);

router.patch("/update/:_id", auth, controller.updateCustomer);

router.delete("/delete/:_id", auth, controller.deleteCustomer);

// router.get("/sign-out", auth, controller.signOut);

// router.post("/logout-all", auth, controller.signOutAll);

// // router.post("/sign-up", controller.signUp);




// router.delete("/delete", auth, controller.deleteProfile);

module.exports = router;
