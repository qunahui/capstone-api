const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');
const SendoProduct = require('../models/sendoProduct')
const Storage = require('../models/storage')
const timeDiff = require('../utils/timeDiff')
const Cookie = require('cookie')


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
      const storage = await Storage.findById({ _id: req.user.currentStorage.storageId })
      const { token, expires } = response.result
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
        expires,
        status: 'connected',
      }
      // storage.sendoCredentials.push(insertCredential)
      // await Storage.findOneAndUpdate({ _id: req.user.currentStorage.storageId }, storage, { upsert: true}, (err, doc) => {
      //   res.status(200).send(insertCredential)
      // })

      await Storage.findOneAndUpdate({ _id: req.user.currentStorage.storageId }, {
        $push: {
          sendoCredentials: insertCredential
        }
      })

      res.status(200).send(insertCredential)
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

module.exports.getSendoToken = async (req, res) => {
    const { credential } = req.body
    const { currentStorage } = req.user

    const timeDifference = timeDiff(new Date(), new Date(credential.expires))
    const isTokenAvailable = timeDifference.hoursDifference <= 0

    if(isTokenAvailable === true) {
      return res.status(200).send(credential)
    }

    try {
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
        const { token, expires } = response.body.result

        await Storage.updateOne({ 
          id: currentStorage.storageId,
          sendoCredentials: {
            $elemMatch: {
              _id: credential._id,
              store_id: credential.store_id
            }
          }
        } , {
          $set: {
            "sendoCredentials.$.access_token": token,
            "sendoCredentials.$.expires": expires,
          }
        })

        const newCredential = await Storage.findOne({
          id: currentStorage.storageId,
          sendoCredentials: {
            $elemMatch: {
              _id: credential._id,
              store_id: credential.store_id
            }
          }
        })

        return res.status(200).send(newCredential)
      })

    } catch(e) {
      console.log("Error: ", e)
      res.status(400).send(Error({ message: 'Lấy sendo token thất bại !'}))
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
            'Authorization': 'bearer '+ req.accessToken
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          res.status(response.statusCode).send(response.body)
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
  
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product',
          'headers': {
            'Authorization': 'bearer '+ req.accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        };
        
      request(options, function (error, response) {
        if (error) throw new Error(error);

        console.log(response.body)
        res.status(response.statusCode).send(response.body)
          
        
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.getWardById = async (req, res) =>{
  // console.log(req.headers)
  
  const wardId = req.params.id;
  
 
  
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/address/ward/' + wardId,
          'headers': {
            'Authorization': 'bearer '+ req.accessToken
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);

          res.status(response.statusCode).send(response.body)
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
            'Authorization': 'bearer '+ req.accessToken
          }
        };
        request(options, function (error, response) {
          if(error) throw  new Error(error)
          res.status(response.statusCode).send(response.body)
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
            'Authorization': 'bearer '+ req.accessToken
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);

          
          res.status(response.statusCode).send(response.body)
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
            'Authorization': 'bearer ' + req.accessToken
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          
          res.status(response.statusCode).send(response.body)
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
            'Authorization': 'bearer ' + req.accessToken
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          res.status(response.statusCode).send(response.body)
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


module.exports.searchOrderOnSendo =  async (req, res) =>{
  //filter order, search by name, date_from, date_to
  //if nothing-> get all
  try {
    const options = {
        'method': 'POST',
        'url': 'https://open.sendo.vn/api/partner/salesorder/search',
        'headers': {
          'Authorization': 'bearer '+ req.accessToken,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({
          "page_size":req.body.page_size,
          "order_status":req.body.order_status,
          "order_date_from":req.body.order_date_from,
          "order_date_to":req.body.order_date_to,
          "order_status_date_from":req.body.order_status_date_from,
          "order_status_date_to":req.body.order_status_date_to,
          "token":req.body.token})
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        //console.log(response.body);
        res.status(response.statusCode).send(response.body)
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
          'Authorization': 'bearer '+ req.accessToken
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        //console.log(response.body);
        res.status(response.statusCode).send(response.body)
      });
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.updateOrderStatus = async (req, res) => {
  // order status
  // 3: confirm order (be careful, dont use)
  //13: cancel order (include reason)
  
  try {
    const options = {
        'method': 'PUT',
        'url': 'https://open.sendo.vn/api/partner/salesorder',
        'headers': {
          'Authorization': 'bearer '+ req.accessToken,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({
          "order_number":req.params.id,
          "order_status":req.body.orderStatus,
          "cancel_order_reason": req.body.cancelReason})
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        //console.log(response.body);
        res.status(response.statusCode).send(response.body)
      });
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getOrderByIdOnSendo = async (req, res) => {

  const orderId = req.params.id;
  
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/partner/salesorder/' + orderId,
          'headers': {
            'Authorization': 'bearer '+ req.accessToken
          }
        };
        request(options, function (error, response) {
          if (error){
            
            throw new Error(error);
            
          } 
          //console.log(response.body);
          res.status(response.statusCode).send(response.body)
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
module.exports.updateProduct = async (req, res) => {
  
  const productId = req.params.id;
  const item = req.body
 
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product/update-by-field-mask',
          'headers': {
            'Authorization': 'bearer '+ req.accessToken,
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
          res.status(response.statusCode).send(response.body)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.updateMultiProduct = async (req, res) =>{
  
  const items = req.body
  
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product/list',
          'headers': {
            'Authorization': 'bearer '+ req.accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(items)
        };
        
      request(options, function (error, response) {
        if (error) throw new Error(error);

        console.log(response.body)
        console.log(response.statusCode)

        res.status(response.statusCode).send(response.body)
          
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
            'Authorization': 'bearer '+ req.accessToken,
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
          res.status(response.statusCode).send(response.body)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}