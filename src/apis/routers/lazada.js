const express = require("express");
const request = require("request")
const router = express.Router();
const controller = require("../controllers/lazada");
var multer  = require('multer')
const path = require('path');
const { check2, check1 } = require("../../middlewares/check");

//const upload = multer ({ dest: path.join(__dirname, '../../temp/')})

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../temp/'))
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname.split('.')[0] + '_' + Date.now().toString() + '.' + file.mimetype.split('/')[1])
   }
})

var upload = multer({ 
  storage: storage
})

// router.get('/first-connect', controller.authorizeCredential)
router.get('/authorize', controller.authorizeCredential)
router.get('/token', controller.getAccessToken)
router.get('/products', controller.getAllProducts)
//router.post('/sign', controller.createSign)

router.get('/refresh-token/',check2, controller.refreshToken)
router.post('/fetch-products', controller.fetchProducts)
router.get('/products/:id', controller.getProductById)

router.get('/category-tree', controller.getCategoryTree) // dont use :)
router.get('/attribute/:id', controller.getAttributes)
router.get('/brands', controller.getBrands) //dont know what it use for
router.get('/suggestion', controller.getCategorySuggestion) // it can be useful
router.post('/qc-status', controller.getQcStatus)

router.post('/seller', controller.getSellerInfo)
router.get('/seller-metrics', controller.getSellerMetrics)
router.post('/update-seller-email', controller.updateSellerEmail)
router.post('/upload-image', upload.single('image') ,check1, controller.uploadImage)
router.patch('/products',check1, controller.updateProductOnLazada)
router.post('/products', check1, controller.createProductOnLazada)
router.delete('/products', check1, controller.deleteProductOnLazada)

router.get('/cancel-reason', check1, controller.getCancelReason)

router.get('/order', controller.searchOrder)
router.get('/orders/:id', check1, controller.getOrderByIdOnLazada)
router.post('/orders/cancel/:id', check1, controller.cancelOrderOnLazada)

router.get('/orders/items/:id', check1, controller.getOrderItems)

module.exports = router;