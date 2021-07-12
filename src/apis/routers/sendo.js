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


// router.post('/ping', (req, res) => {
//   // received object
//   // switch case
  
//   const data = req.body
//   console.log(req.body)

//   //console.log(util.inspect(req.body, false, null, true /* enable colors */))
//   switch(data.type){
//     case 'PRODUCT.CREATE':{
//       request.post({ url: "http://localhost:5000/products/sendo/create-ping", 
//       json: data })

//       break 
//     }
//     case 'PRODUCT.UPDATE': {
//       request.patch({ url:"http://localhost:5000/products/"+data.id,
//         json: data
//       })

//       break
//     }
//     case 'SALESORDER.CREATE': {
//       request.post({ url: "http://localhost:5000/orders/sendo/create-order-ping",
//         json: data
//       })

//       break
//     }
//     //sendo chưa hoạt động 
//     case 'SALESORDER.UPDATE': {
//       request.patch({ url:"http://localhost:5000/orders/sendo/"+data.id,
//         json: data
//       })

//       break
//     }
//     default:
//       break
//   }
// })