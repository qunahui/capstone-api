const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sync");

router.post('/', auth, controller.syncDataFromChosenCres)

module.exports = router