const express = require("express");
const request = require("request")
const router = express.Router();
const controller = require("../controllers/lazada");
const auth = require("../../middlewares/auth");
var multer  = require('multer')
const path = require('path');

//const upload = multer ({ dest: path.join(__dirname, '../../temp/')})
router.use(auth) //all requests to this router will first hit this middleware

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


router.get('/authorize', controller.authorizeCredential)

router.post('/login', controller.getAccessToken)  

router.post('/refresh-token/', controller.refreshToken)

router.get('/products/:id', controller.getProductById)

router.get('/products/seller-sku/:id', controller.getProductBySellerSku)

router.get('/attribute/:id', controller.getAttributes)

router.post('/qc-status', controller.getQcStatus)

router.get('/seller', controller.getSellerInfo)

router.get('/seller-metrics', controller.getSellerMetrics)

router.post('/upload-image', upload.single('image') , controller.uploadImage)

router.patch('/products/', controller.updateProduct)

router.patch('/products/price_quantity', controller.updatePriceQuantity)

router.post('/products', controller.createProductOnLazada)

router.delete('/products/:sellerSku', controller.deleteProduct)

router.get('/cancel-reason', controller.getCancelReason)

router.get('/orders/document', controller.getDocument)

router.get('/orders', controller.searchOrder)

router.get('/orders/:id', controller.getOrderByIdOnLazada)

router.post('/orders/cancel/:id', controller.cancelOrderOnLazada)

router.post('/orders/pack/', controller.setStatusToPackedByMarketplace)

router.post('/orders/rts/', controller.setStatusToReadyToShip)

router.get('/orders/items/:id', controller.getOrderItems)

// router.get('/first-connect', controller.authorizeCredential)
//router.post('/sign', controller.createSign)
//router.get('/category-tree', controller.getCategoryTree) // dont use 
//router.get('/brands', controller.getBrands) 
//router.patch('/products/:sellerSku', controller.updateProduct)  //api cua laz thay doi
module.exports = router;