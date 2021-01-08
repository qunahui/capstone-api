const express = require("express");
const request = require("request")
const router = express.Router();
const controller = require("../controllers/lazada");
var multer  = require('multer')
const path = require('path')
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

router.get('/call_back', (req, res) => {
    console.log(req.query.code)
  })
//router.post('/sign', controller.createSign)

router.get('/refresh-token/:refresh_token', controller.refreshToken)
router.get('/product', controller.searchProduct)
router.get('/product/:id', controller.getProductById)

router.get('/category-tree', controller.getCategoryTree) // dont use :)
router.get('/attribute/:id', controller.getAttributes)
router.get('/brands', controller.getBrands) //dont know what it use for
router.get('/suggestion', controller.getCategorySuggestion) // it can be useful
router.get('/qc-status', controller.getQcStatus)

router.get('/seller', controller.getSellerInfo)
router.get('/seller-metrics', controller.getSellerMetrics)
router.post('/update-seller-email', controller.updateSellerEmail)
router.post('/upload-image', upload.single('image') ,controller.uploadImage)
router.post('/update-product', controller.updateProduct)
router.post('/create-product', controller.createProduct)
router.post('/remove-product', controller.removeProduct)

router.get('/cancel-reason', controller.getCancelReason)

router.get('/order', controller.searchOrder)
router.get('/order/:id', controller.getOrderById)
router.post('/cancel-order', controller.cancelOrder)

router.get('/order-item/:id', controller.getOrderItem)

module.exports = router;