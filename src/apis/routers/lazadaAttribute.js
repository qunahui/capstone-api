const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require('../controllers/lazadaAttribute')


router.use(auth) //all requests to this router will first hit this middleware

router.get('/:categoryId', controller.getLazadaAttribute)

// router.get('/test', controller.test)

// router.get("/create", controller.create)

// router.get('/fix', controller.fix)


module.exports = router;
