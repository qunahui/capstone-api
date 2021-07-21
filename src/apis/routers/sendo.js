const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendo");

router.use(auth) //all requests to this router will first hit this middleware

router.post('/authorize', controller.authorizeCredential)

router.post('/login', controller.getSendoToken)

router.get('/attribute/:categoryId', controller.getAttribute)
//product
router.get('/products/search', controller.searchProduct) //filter product, if none-> get all

router.post('/products/', controller.createProduct)

router.get('/products/:id', controller.getProductById)

router.patch('/products/', controller.updateProduct) 

router.delete("/products/:id", controller.deleteProduct);
//order
router.get('/orders/search', controller.searchOrder) //filter order, if none -> get all

router.get('/cancel-reason', controller.getCancelReason) 

router.get('/orders/:id', controller.getOrderById)

router.put('/orders/:id', controller.updateOrderStatus) 

router.get('/print-bill/:order_number', controller.printBill) 

//router.get('/category/:id', controller.getCategory)
//router.get('/ward/:id', controller.getWardById)
//router.get('/district/:id', controller.getDistrictById)
//router.get('/region/:id', controller.getRegionById)
//router.get('/category/', controller.createSendoCategory)
//router.get('/sync-products', controller.syncAllProductSendo)
//router.get('/sync-orders', controller.syncAllOrderSendo)
module.exports = router;
