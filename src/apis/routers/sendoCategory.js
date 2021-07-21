const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendoCategory");
const util = require('util')

router.use(auth) //all requests to this router will first hit this middleware

router.get("/", controller.getSendoListCategory);

router.get("/search", controller.searchSendoCategory);

router.post("/suggest", controller.getSuggestCategory);

module.exports = router;