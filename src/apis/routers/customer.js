const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/customer");


router.use(auth) //all requests to this router will first hit this middleware

router.get("/check/:email", controller.checkCustomerExist)

router.get("/id/:_id", controller.getCustomerById);

router.get("/search/", controller.searchCustomer);

router.get("/", controller.getAllCustomer);

router.post("/", controller.createCustomer);

router.patch("/update/:_id", controller.updateCustomer);

router.delete("/delete/:_id", controller.deleteCustomer);

module.exports = router;
