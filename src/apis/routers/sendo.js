const express = require("express");
const request = require("request")
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendo");
const productController = require("../controllers/product")
const util = require('util');
router.post('/ping', (req, res) => {
  // received object
  // switch case
  
  const data = req.body
  console.log(req.body) 
  
  //console.log(util.inspect(req.body, false, null, true /* enable colors */))
  switch(data.type){
    case 'PRODUCT.CREATE':{
      request.post({ url: "http://localhost:5000/products/sendo/create-ping", 
      json: data })

      break 
    }
    case 'PRODUCT.UPDATE': {
      request.patch({ url:"http://localhost:5000/products/"+data.id,
        json: data
      })

      break
    }
    case 'SALESORDER.CREATE': {
      request.post({ url: "http://localhost:5000/orders/sendo/create-order-ping",
        json: data
      })

      break
    }
    //sendo chưa hoạt động 
    case 'SALESORDER.UPDATE': {
      request.patch({ url:"http://localhost:5000/orders/sendo/"+data.id,
        json: data
      })

      break
    }
    default:
      break
  }
})
// local's routes
router.get('/products', controller.getAllProducts)
//api's routes
router.post('/authorize', controller.authorizeCredential)
router.post('/login', controller.getSendoToken)
router.post('/products/', controller.createProductOnSendo)
//router.post('/search-products', controller.searchSendoProduct) //filter product, if none-> get all
router.post('/fetch-products', controller.fetchProducts)

router.get('/category/:id', controller.getSendoCategory)
router.get('/ward/:id', controller.getWardById)
router.get('/district/:id', controller.getDistrictById)
router.get('/region/:id', controller.getRegionById)
router.get('/attribute/:id', controller.getSendoAttribute)
router.get('/products/:id', controller.getSendoProductById)
//router.get('/sync-products', controller.syncAllProductSendo)
router.get('/orders', controller.searchSendoOrder) //filter order, if none -> get all
router.get('/cancel-reason', controller.getCancelReason) //extra route, it will be useful, or not
router.get('/orders/:id', controller.getSendoOrderById)
//router.get('/sync-orders', controller.syncAllOrderSendo)

router.put('/update-order-status', controller.updateOrderStatus)
router.patch('/products/:id', controller.updateProductOnSendo) 
router.delete("/products/:id", controller.deleteProductOnSendo);
module.exports = router;

/*
  app.post('/api/sendo', (req, res) => {
  var options = {
    url: req.body.url,
    method: req.body.method,
    json: req.body.data
  };

  console.log(options); 

  request(options, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      console.log(response);
    }
    return res.status(500).json({ type: 'error', message: err.message });
  })
});

*/

/*
  request({
    url: 'https://open.sendo.vn/login',
    method: 'POST',
    json: {
      shop_key,
      secret_key,
    }
  }, function(err, response, body) {
    if(!err && response.statusCode === 200) {
      const { token, expires } = body.result
      const sendoToken = new PlatformToken({
        platform: 'sendo',
        userId: req.user,
        value: token,
        expires: new Date(expires)
      })

      sendoToken.save()

      return res.status(201).send({ token, expires })
    }
  })
*/