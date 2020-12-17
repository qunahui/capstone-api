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

router.get('/ping', (req, res) => {
    const code = req.query.code
    console.log(code)
  })
//router.post('/sign', controller.createSign)
router.get('/product', controller.searchProduct)
router.get('/product/:id', controller.getProductById)

router.get('/category-tree', controller.getCategoryTree) // dont use :)
router.get('/attribute/:id', controller.getAttributes)
router.get('/brands', controller.getBrands) //dont know what it use for
router.get('/suggestion', controller.getCategorySuggestion) // it can be useful

router.get('/seller', controller.getSellerInfo)
router.get('/seller-metrics', controller.getSellerMetrics)
router.post('/update-seller-email', controller.updateSellerEmail)
router.post('/upload-image', upload.single('image') ,controller.uploadImage)
module.exports = router;