const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');
const { createSendoProduct } = require("./sendoProduct");
const SendoProduct = require('../models/sendoProduct')
const Storage = require('../models/storage')

module.exports.getAllProducts = async (req, res) => {
  try {
    const { store_id } = req.query;
    const sendoProducts = await SendoProduct.find({ store_id })

    res.status(200).send(sendoProducts)
  } catch(e) {
    res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.authorizeCredential = async (req, res) => {
  try {
    const { app_key, app_secret } = req.body
    const options = {
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
    }
    await rp(options).then(async response => {
      console.log("Begin find storage")
      const storage = await Storage.findById({ _id: req.body.storageId })
      const { token } = response.result
      const matchedCredential = storage.sendoCredentials.find(credential => credential.app_key === app_key)
      if(matchedCredential) {
        return res.status(409).send(Error({ message: 'Bạn đã kết nối với gian hàng này' }))
      }
      const insertCredential = {
        app_key,
        app_secret,
        store_id: app_key,
        store_name: 'SENDO-' + (storage.sendoCredentials.length + 1),
        platform_name: 'sendo',
        access_token: token,
        status: 'connected',
      }
      storage.sendoCredentials.push(insertCredential)
      await Storage.findOneAndUpdate({ _id: req.body.storageId }, storage, { upsert: true}, (err, doc) => {
        res.status(200).send(insertCredential)
      })
    }).catch(e => {
      console.log("Response: ", e.response)
      const { body } = e.response
      console.log("Error found.....", e.response.body)
      res.status(body.statusCode).send(Error({ message: body.error.message }))
    })
  } catch(e) {
    console.log(e)
    res.status(500).send({ message: 'Something went wrong'})
  }
}

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
  console.log(req.body)
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
    const response = await rp(options)
    const products = JSON.parse(response).result.data
    await Promise.all(products.map(async product => {
      const fullProduct = await rp({
        method: 'GET',
        url: 'http://localhost:5000/api/sendo/products/' + product.id + '?access_token=' + req.body.access_token
      })
      const actuallyFullProduct = JSON.parse(fullProduct)
      await createSendoProduct(actuallyFullProduct, { store_id: req.body.store_id })
    }))

    console.log("Run this")

    const sendoProduct = await SendoProduct.find({ storageId: req.body.storageId})

    res.status(200).send(sendoProduct)
  } catch(e) {
    console.log(e)
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
            'Authorization': 'bearer '+ req.query.access_token
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          const categories = JSON.parse(response.body).result
          res.send(categories)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
//create or update product
module.exports.createProductOnSendo = async (req, res) =>{
  //id = 0 -> create
  //id != 0 -> update
  const item = {id: 0, ...req.body};
  //res.send(item)
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product',
          'headers': {
            'Authorization': 'bearer '+ req.query.access_token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        };
        
      request(options, function (error, response) {
          if (error) throw new Error(error);
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
            'Authorization': 'bearer '+ req.query.access_token
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
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
            'Authorization': 'bearer '+ req.query.access_token
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          const district = JSON.parse(response.body).result.name
          res.send(district)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.getRegionById = async (req, res) =>{
  
  const regionId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/address/region/' + regionId,
          'headers': {
            'Authorization': 'bearer '+ req.query.access_token
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
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
            'Authorization': 'bearer ' + req.query.access_token
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          const attributes = JSON.parse(response.body).result
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
            'Authorization': 'bearer ' + req.query.access_token
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
          'Authorization': 'bearer '+req.query.access_token
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
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
          'Authorization': 'bearer '+ req.query.access_token,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({"order_number":orderNumber,"order_status":orderStatus,"cancel_order_reason": cancelReason})
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
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
            'Authorization': 'bearer '+ req.query.access_token
          }
        };
        request(options, function (error, response) {
          if (error){
            
            throw new Error(error);
            
          } 
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
module.exports.updateProductOnSendo = async (req, res) => {
  const productId = req.params.id;
  const item = req.body
  console.log()
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product/update-by-field-mask',
          'headers': {
            'Authorization': 'bearer '+ req.query.access_token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            [
              {
                "id": productId,
                "field_mask": Object.keys(item),
                ...item
              }
            ]
        )
      };
      //res.send(options)
        request(options, function (error, response) {
          if (error){
            
            throw new Error(error);
            
          } 
          //console.log(response.body);
          const product = JSON.parse(response.body).result
          res.send(product)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.deleteProductOnSendo = async (req, res) => {
  const productId = req.params.id;
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product/update-by-field-mask',
          'headers': {
            'Authorization': 'bearer '+ req.query.access_token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            [
              {
              "id": productId,
              "field_mask": [
                "product_status"
              ],
              "product_status": 5
              }
            ]
        )
      };
        request(options, function (error, response) {
          if (error){
            
            throw new Error(error);
            
          } 
          //console.log(response.body);
          const product = JSON.parse(response.body).result
          res.send(product)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}