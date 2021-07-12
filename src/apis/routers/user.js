const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/user");

router.get("/me", auth, controller.getCurrentUser);

router.get("/sign-out", auth, controller.signOut);

router.post("/logout-all", auth, controller.signOutAll);

router.patch("/update", auth, controller.editProfile);

router.get("/change-default/:id", auth, controller.changeDefaultStorage)

router.delete("/delete", auth, controller.deleteProfile);

router.post("/sign-in", controller.signIn);

router.post("/sign-up", controller.signUp);

router.patch("/change-password", controller.changePassword);

router.get("/reset-password", controller.resetPassword);

module.exports = router;
