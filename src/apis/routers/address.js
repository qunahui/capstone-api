const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const addressController = require("../controllers/address");


router.get("/region", addressController.getAllRegion);
router.get("/region/:id", addressController.getRegionById)
router.get("/district/", addressController.getAllDistrictByRegionId)
router.get("/district/:id", addressController.getDistrictById)
router.get("/ward/", addressController.getAllWardByDistrictId)
router.get("/ward/:id", addressController.getWardById)

router.post("/create-region", addressController.createRegion);

module.exports = router;