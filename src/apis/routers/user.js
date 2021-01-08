const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/user");

router.get("/me", auth, controller.getCurrentUser);

router.post("/sign-in", controller.signIn);

router.post("/sign-up", controller.signUp);

router.post("/sign-out", auth, controller.signOut);

router.post("/logout-all", auth, controller.signOutAll);

// router.post("/sign-up", controller.signUp);

router.patch("/update", auth, controller.editProfile);


router.delete("/delete", auth, controller.deleteProfile);

module.exports = router;
