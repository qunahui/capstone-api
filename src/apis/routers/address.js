const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/address");


router.get("/provinces", controller.getProvinces);
router.get("/districts/:provinceId", controller.getDistricts);
router.get("/wards/:districtId", controller.getWards);

module.exports = router;