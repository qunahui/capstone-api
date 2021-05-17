const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/address");

//province
router.get("/provinces", auth, controller.getProvinces); // just use this one
router.post("/provinces", auth, controller.createProvince);
router.get("/provinces/:id", auth, controller.getProvinceById);
router.patch("/provinces/:id", auth, controller.updateProvince);
router.delete("/provinces/:id", auth, controller.deleteProvince);

router.get("/province-districts/:provinceId", auth, controller.getDistrictsByProvinceId); // just use this one
router.get("/districts", auth, controller.getDistricts);
router.post("/districts", auth, controller.createDistrict);
router.get("/districts/:id", auth, controller.getDistrictById);
router.patch("/districts/:id", auth, controller.updateDistrict);
router.delete("/districts/:id", auth, controller.deleteDistrict);


router.get("/district-wards/:districtId", auth, controller.getWardsByDistrictId); // just use this one
router.get("/wards", auth, controller.getWards);
router.post("/wards", auth, controller.createWard);
router.get("/wards/:id", auth, controller.getWardById);
router.patch("/wards/:id", auth, controller.updateWard);
router.delete("/wards/:id", auth, controller.deleteWard);


module.exports = router;