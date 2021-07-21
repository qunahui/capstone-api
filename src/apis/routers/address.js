const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/address");

router.use(auth) //all requests to this router will first hit this middleware

router.get("/provinces", controller.getProvinces); // just use this one
// router.post("/provinces", controller.createProvince);
// router.get("/provinces/:id", controller.getProvinceById);
// router.patch("/provinces/:id", controller.updateProvince);
// router.delete("/provinces/:id", controller.deleteProvince);

router.get("/province-districts/:provinceId", controller.getDistrictsByProvinceId); // just use this one
// router.get("/districts", controller.getDistricts);
// router.post("/districts", controller.createDistrict);
// router.get("/districts/:id", controller.getDistrictById);
// router.patch("/districts/:id", controller.updateDistrict);
// router.delete("/districts/:id", controller.deleteDistrict);


router.get("/district-wards/:districtId", controller.getWardsByDistrictId); // just use this one
// router.get("/wards", controller.getWards);
// router.post("/wards", controller.createWard);
// router.get("/wards/:id", controller.getWardById);
// router.patch("/wards/:id", controller.updateWard);
// router.delete("/wards/:id", controller.deleteWard);


module.exports = router;