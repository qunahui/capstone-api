const express = require("express");
const request = require("request")
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendo");
const productController = require("../controllers/product")
router.post('/ping', (req, res) => {
  // received object
  // switch case
  
  const data = req.body.data
  console.log(req.body)
  switch(data.type){
    case 'PRODUCT.CREATE':{
      request.post({ url: "http://localhost:5000/products/create-product", 
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
      request.post({ url: "http://localhost:5000/orders/sendo/create-order",
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
router.post('/login', auth, controller.getSendoToken)
router.post('/product', controller.sendoProduct)

router.get('/category/:id', controller.getSendoCategory)
router.get('/attribute/:id', controller.getSendoAttribute)
router.get('/product/:id', controller.getSendoProductById)
router.get('/product', controller.searchSendoProduct) //filter product, if none-> get all
router.get('/sync-product', controller.syncAllProductSendo)
router.get('/order', controller.searchSendoOrder) //filter order, if none -> get all
router.get('/cancel-reason', controller.getCancelReason) //extra route, it will be useful, or not
router.get('/order/:id', controller.getSendoOrderById)
router.get('/sync-order', controller.syncAllOrderSendo)

router.put('/update-order-status', controller.updateOrderStatus) 

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