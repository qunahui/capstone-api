const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/employee")

router.get('/', auth, controller.getAllEmployee)

router.post('/invite', auth, controller.inviteEmployee)

router.post('/response', auth, controller.inviteResponse)

router.delete('/:id', auth, controller.deleteEmployee)

module.exports = router;
