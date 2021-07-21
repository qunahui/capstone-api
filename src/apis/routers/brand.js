const express = require("express");
const router = express.Router();
const controller = require('../controllers/brand')
const auth = require("../../middlewares/auth");

router.use(auth) //all requests to this router will first hit this middleware

router.get('/search/:search', controller.searchBrands)

// router.get("/create", controller.createBrands)

module.exports = router;
