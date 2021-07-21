const express = require("express");
const router = express.Router();
const controller = require("../controllers/lazada");
const auth = require("../../middlewares/auth");
//var multer  = require('multer')
//const path = require('path');

//const upload = multer ({ dest: path.join(__dirname, '../../temp/')})
router.use(auth) //all requests to this router will first hit this middleware

// var storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, path.join(__dirname, '../../temp/'))
//   },
//   filename: function(req, file, cb) {
//     cb(null, file.originalname.split('.')[0] + '_' + Date.now().toString() + '.' + file.mimetype.split('/')[1])
//    }
// })

// var upload = multer({ 
//   storage: storage
// })


router.get('/authorize', controller.authorizeCredential)

router.post('/login', controller.getAccessToken)  

router.post('/refresh-token/', controller.refreshToken)

router.get('/products/:id', controller.getProductById)

router.get('/products/seller-sku/:id', controller.getProductBySellerSku)

router.post('/qc-status', controller.getQcStatus)

router.get('/seller', controller.getSellerInfo)

router.get('/seller-metrics', controller.getSellerMetrics)

router.patch('/products/', controller.updateProduct)

router.post('/products', controller.createProduct)

router.delete('/products/:sellerSku', controller.deleteProduct)

router.get('/orders/document', controller.getDocument)

router.get('/orders', controller.searchOrder)

router.get('/orders/:id', controller.getOrderById)

router.post('/orders/cancel/:id', controller.cancelOrder)

router.post('/orders/pack/', controller.setStatusToPackedByMarketplace)

router.post('/orders/rts/', controller.setStatusToReadyToShip)

router.get('/orders/items/:id', controller.getOrderItems)

router.get('/attributes/:categoryId', controller.getAttributes)

//router.patch('/products/price-quantity', controller.updatePriceQuantity)
//router.get('/cancel-reason', controller.getCancelReason)
//router.post('/upload-image', upload.single('image') , controller.uploadImage)
//router.get('/category-tree', controller.getCategoryTree) 
//router.get('/brands', controller.getBrands) 
module.exports = router;