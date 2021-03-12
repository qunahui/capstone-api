const express = require("express");
const request = require("request")
const router = express.Router();
const controller = require("../controllers/lazada");
const auth = require("../../middlewares/auth");
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
router.get('/authorize', auth, controller.authorizeCredential)
router.get('/token', auth, controller.getAccessToken)  // t4 fix cùng hui
//router.post('/sign', controller.createSign)

router.get('/refresh-token/',auth, controller.refreshToken)

router.get('/products/:id', auth, controller.getProductById)
router.get('/products/seller-sku/:id', auth, controller.getProductBySellerSku)
router.get('/category-tree', auth, controller.getCategoryTree) // dont use :)
router.get('/attribute/:id', controller.getAttributes)
router.get('/brands', auth, controller.getBrands) //dont know what it use for
router.get('/suggestion', auth, controller.getCategorySuggestion) // it can be useful // stop working
router.post('/qc-status', auth, controller.getQcStatus)

router.get('/seller', auth, controller.getSellerInfo)
router.get('/seller-metrics', auth, controller.getSellerMetrics)
router.post('/update-seller-email', auth, controller.updateSellerEmail) //not working
router.post('/upload-image', upload.single('image') ,auth , controller.uploadImage)
router.patch('/products/:sellerSku',auth, controller.updateProduct)
router.post('/products', auth, controller.createProductOnLazada)
router.delete('/products/:sellerSku', auth, controller.deleteProduct)

router.get('/cancel-reason', auth, controller.getCancelReason)

router.get('/order', auth, controller.searchOrder)
router.get('/orders/:id', auth, controller.getOrderByIdOnLazada)
router.post('/orders/cancel/:id', auth, controller.cancelOrderOnLazada)

router.get('/orders/items/:id', auth, controller.getOrderItems)

module.exports = router;