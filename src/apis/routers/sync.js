const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sync");

router.use(auth) //all requests to this router will first hit this middleware

router.post('/', controller.syncDataFromChosenCres)

module.exports = router