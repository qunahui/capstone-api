const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/employee")

router.use(auth) //all requests to this router will first hit this middleware

router.get('/', controller.getAllEmployee)

router.post('/invite', controller.inviteEmployee)

router.post('/response', controller.inviteResponse)

router.delete('/:id', controller.deleteEmployee)

module.exports = router;
