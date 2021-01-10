const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');

module.exports.getSendoToken = async (credential) => {
    try {
      if(credential.access_token) {
        return credential
      }
      const { app_key, app_secret } = credential
      await rp({
        method: 'POST',
        url: 'https://open.sendo.vn/login',
        header: {
          'Content-Type' : 'application/json'
        },
        json: true,
        body: {
          shop_key: app_key,
          secret_key: app_secret
        }
      }, async function(err, response) {
        let status = credential.status;
        const { success, error, statusCode } = response.body;
        if(success) {
          status = "connected"
          credential.access_token = response.body.result.token;
        } else {
          status = "failed"
        }
        credential.status = status;
      })
      console.log("Finish")
      return credential
    } catch(e) {
      console.log("Error: ", e)
    }
}

module.exports.fetchProducts = async (req, res) => {
  try {
    const options = {
        'method': 'POST',
        'url': 'https://open.sendo.vn/api/partner/product/search',
        'headers': {
          'Authorization': 'bearer ' + req.body.access_token,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({"page_size":10,"product_name":"","date_from":"2020-05-01","date_to":"9999-10-28","token":""})
    };
    console.log("Options: ", options)
    request(options, function (error, response) {
      const products = JSON.parse(response.body).result.data
      console.log(products)
      res.send(products)
    });
  } catch(e) {
    console.log(e)
  }
  // request({ 
  //   method: 'POST',
  //   url: 'http://localhost:5000/api/sendo/products',
  //   body: JSON.stringify(req.body),
  // }, function(error, response){
    // const products = JSON.parse(response.body)
    // const storeName = products[0].store_name
    // products.forEach(e => {
    //   request.get({ url: "http://localhost:5000/api/sendo/product/"+e.id}, function(error, response){
    //     const product = JSON.parse(response.body)
    //     product["store_name"] = storeName
    //     request.post({ url: "http://localhost:5000/products/create-product-sync-sendo", 
    //     json: product })
    //   })
    // });
  // })

  // res.send("done")
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
module.exports.getWardById = async (req, res) =>{
  
  const wardId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/address/ward/' + wardId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwOTg0MTc0NCwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.TuSYGKaXtsi9LtcB1FnplZlvk1zQFmPiByFhoVlHMRc'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const ward = JSON.parse(response.body).result.name
          res.send(ward)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.getDistrictById = async (req, res) =>{
  
  const districtId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/address/district/' + districtId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwOTg0MTc0NCwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.TuSYGKaXtsi9LtcB1FnplZlvk1zQFmPiByFhoVlHMRc'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const district = JSON.parse(response.body).result.name
          res.send(district)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.getRegionById = async (req, res) =>{
  
  const districtId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/address/region/' + districtId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwOTg0MTc0NCwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.TuSYGKaXtsi9LtcB1FnplZlvk1zQFmPiByFhoVlHMRc'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const region = JSON.parse(response.body).result.name
          res.send(region)
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
  // console.log("Body: ",req)
  //filter product, search by name, date_from, date_to
  //if nothing-> get all
  // try {
  //     const options = {
  //         'method': 'POST',
  //         'url': 'https://open.sendo.vn/api/partner/product/search',
  //         'headers': {
  //           'Authorization': 'bearer ' + req.body.access_token,
  //           'Content-Type': 'application/json',
  //           'cache-control': 'no-cache'
  //         },
  //         body: JSON.stringify({"page_size":10,"product_name":"","date_from":"2020-05-01","date_to":"9999-10-28","token":""})
  //       };
  //       console.log("Options: ", options)
  //       request(options, function (error, response) {
  //         const products = JSON.parse(response.body).result.data
  //         res.send(products)
  //       });
  // } catch (e) {
  //     res.status(500).send(Error(e));
  // }
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
        request.post({ url: "http://localhost:5000/products/create-product-sync-sendo", 
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
      request.post({url: "http://localhost:5000/orders/sendo/create-order-sync",
                    json: e})
    });
    //console.log(storeName)
  })

  res.send("done")
}