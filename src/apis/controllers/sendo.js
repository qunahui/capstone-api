const User = require("../models/user");
const Error = require("../utils/error");
const request = require('request');
const PlatformToken = require("../models/platformToken");

module.exports.getSendoToken = async (req, res) => {
  const platformToken = await PlatformToken.findOne({ uid: req.user.uid, platform: 'sendo'});
  if(platformToken) {
    console.log("Getting old token")
    return res.status(200).send({
      sendoToken: platformToken.token
    })
  }
  
  try {
    const { sendoCredentials: { shop_key, secret_key } } = await User.findByCredentials(req.user.uid);
    if(shop_key && secret_key) {
      request({
        url: 'https://open.sendo.vn/login',
        method: 'POST',
        json: {
          shop_key,
          secret_key,
        }
      }, async function (err, response, body) {
        if (!body.error && response.statusCode === 200) {
          const { token, expires } = body.result;
          // update user's sendo token
          await new PlatformToken({
            uid: req.user.uid,
            platform: 'sendo',
            token: token,
          }).save();
          console.log("New token created");
          return res.status(201).send({ sendoToken: token });
        }
        else if (body.error) {
          const { statusCode, error } = body;
          console.log("Error: ", body.error);
          return res.status(statusCode).send(Error(error));
        }
      })
    } else {
      return res.status(404).send(Error({ message: 'Sendo credentials not found. You must register first !'}))
    }
  } catch(e){ 
    return res.status(400).send(Error(e))
  }
}

module.exports.getSendoCategory = async (req, res) =>{
  //category lv4 have attributes but useless
  const categoryId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/partner/category/' + categoryId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjk4ODMzOSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.CZ7ntni8XqlilhdHxhf7b7w3gU72uDohnevGe-RZPIY'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const categories = JSON.parse(response.body)
          res.send(categories)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
//create or update product
module.exports.sendoProduct = async (req, res) =>{
  //id = 0 -> create
  //id != 0 -> update
  const item = req.body;
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product',
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjkzMDE5OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.jEWfCspUxX4j8PMPEXEVewNnyhtCwtI2KMkEHi_PSHc',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        };
      request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          //const product = JSON.parse(re)
          res.send(response.body)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.getSendoAttribute = async (req, res) =>{
  
  const attributeId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/partner/category/attribute/' + attributeId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjk4ODMzOSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.CZ7ntni8XqlilhdHxhf7b7w3gU72uDohnevGe-RZPIY'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const attributes = JSON.parse(response.body)
          res.send(attributes)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.getSendoProductById = async (req, res) =>{
  
  const productId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/partner/product?id=' + productId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjk4ODMzOSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.CZ7ntni8XqlilhdHxhf7b7w3gU72uDohnevGe-RZPIY'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const product = JSON.parse(response.body).result
          res.send(product)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.searchSendoProduct = async (req, res) =>{
  //filter product, search by name, date_from, date_to
  //if nothing-> get all
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product/search',
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjk4ODMzOSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.CZ7ntni8XqlilhdHxhf7b7w3gU72uDohnevGe-RZPIY',
            'Content-Type': 'application/json',
            'cache-control': 'no-cache'
          },
          body: JSON.stringify({"page_size":10,"product_name":"","date_from":"2020-05-01","date_to":"9999-10-28","token":""})
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const products = JSON.parse(response.body).result.data
          res.send(products)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
//req.body.filter : { sync-range}
module.exports.syncAllProductSendo = async (req, res) => {
  request.get({url: 'http://localhost:5000/api/sendo/product'}, function(error, response){
    const products = JSON.parse(response.body)
    const storeName = products[0].store_name
    products.forEach(e => {
      request.get({ url: "http://localhost:5000/api/sendo/product/"+e.id}, function(error, response){
        const product = JSON.parse(response.body)
        product["store_name"] = storeName
        //product["shop_key"] = shopKey
        request.post({ url: "http://localhost:5000/products/create-product", 
        json: product })
        //console.log(response.body)
      })
    });
    //console.log(storeName)
  })

  res.send("done")
}


module.exports.searchSendoOrder =  async (req, res) =>{
  //filter order, search by name, date_from, date_to
  //if nothing-> get all
  try {
    const options = {
        'method': 'POST',
        'url': 'https://open.sendo.vn/api/partner/salesorder/search',
        'headers': {
          'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNzU5MzAzMywiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.oz4feqo6aAl35m1dPWUyljzrQTh_lymbCBXyRIPbNpI',
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({"page_size":10,"order_status":2,"order_date_from":"2020-05-01","order_date_to":"2021-05-07","order_status_date_from":null,"order_status_date_to":null,"token":null})
      };
      request(options, function (error, response) {
        //if (error) throw new Error(error);
        //console.log(response.body);
        const orders = JSON.parse(response.body).result.data
        res.send(orders)
      });
} catch (e) {
    res.status(500).send(Error(e));
}
}

module.exports.getCancelReason =  async (req, res) =>{
  try {
    const options = {
        'method': 'GET',
        'url': 'https://open.sendo.vn/api/partner/salesorder/reason-collection',
        'headers': {
          'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNzUzNjk4OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.v6K1qLSQd9UYTlPYyWTmpy4ygFh1JC76yb2A_Wugnwo'
        }
      };
      request(options, function (error, response) {
        //if (error) throw new Error(error);
        //console.log(response.body);
        const cancelReasons = JSON.parse(response.body).result
        res.send(cancelReasons)
      });
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.updateOrderStatus = async (req, res) => {
  // order status
  // 3: confirm order (be careful, dont use)
  //13: cancel order (include reason)
  const orderNumber = req.body.orderNumber
  const cancelReason = req.body.cancelReason
  const orderStatus = req.body.orderStatus
  try {
    const options = {
        'method': 'PUT',
        'url': 'https://open.sendo.vn/api/partner/salesorder',
        'headers': {
          'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNzUzNjk4OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.v6K1qLSQd9UYTlPYyWTmpy4ygFh1JC76yb2A_Wugnwo',
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({"order_number":orderNumber,"order_status":orderStatus,"cancel_order_reason": cancelReason})
      };
      request(options, function (error, response) {
        //if (error) throw new Error(error);
        //console.log(response.body);
        const orderStatus = JSON.parse(response.body)
        res.send(orderStatus)
      });
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getSendoOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/partner/salesorder/' + orderId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNzU0MDU0MiwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.hia137ETvU6VaII3lLs85OhBen7SdQRXm3uVn9zpTMQ'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const order = JSON.parse(response.body).result
          res.send(order)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}

module.exports.syncAllOrderSendo = async (req, res) =>{
  request.get({url: 'http://localhost:5000/api/sendo/order'}, function(error, response){
    const orders = JSON.parse(response.body)
    orders.forEach(e => {
      request.post({url: "http://localhost:5000/orders/sendo/create-order",
                    json: e})
    });
    //console.log(storeName)
  })

  res.send("done")
}