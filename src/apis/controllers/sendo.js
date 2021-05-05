const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');
const SendoProduct = require('../models/sendoProduct')
const Storage = require('../models/storage')
const timeDiff = require('../utils/timeDiff')
const Cookie = require('cookie')
const SendoCategory = require('../models/sendoCategory')
const util = require('util')


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
      const storage = await Storage.findOne({ _id: req.user.currentStorage.storageId })
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

      await Storage.updateOne({ _id: req.user.currentStorage.storageId }, {
        $addToSet: {
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
    const isTokenAvailable = timeDifference.hoursDifference < 0 ? true : timeDifference.minutesDifference <= 0 ? true : false

    if(isTokenAvailable === true) {
      return res.status(200).send({
        ...credential,
        isCredentialRefreshed: false
      })
    }

    console.log("try refresh sendo token")

    try {
      const { app_key, app_secret } = credential
      const response = await rp({
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
      })

      const { token, expires } = response.result

      await Storage.updateOne({ 
        _id: currentStorage.storageId,
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

      const newStorage = await Storage.findOne({
        id: currentStorage.storageId,
        sendoCredentials: {
          $elemMatch: {
            _id: credential._id,
            store_id: credential.store_id
          }
        }
      }).lean()

      const newCredential = newStorage.sendoCredentials.find(i => i._id.toString() === credential._id)

      return res.status(200).send({
        ...newCredential,
        isCredentialRefreshed: true
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
module.exports.createSendoCategory = async (req, res) =>{
  const dataLv1 = await rp({
    'method': 'GET',
    'url':"https://open.sendo.vn/api/partner/category/0",
    'headers': {
      'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYxNzY5ODc5OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.OD2auZ7MvFr6b78pSiUtTPgPsn-6o_M-X1Jo0AlAzjg'
    }
  })
  const listLv1 = JSON.parse(dataLv1).result
  listLv1.map( async (itemLv1) =>{
      //lv2
      const cateLv1 = new SendoCategory({
        category_id: itemLv1.id,
        name: itemLv1.name,
        idpath: [itemLv1.id],
        namepath: [itemLv1.name]
      })
      await cateLv1.save() 
      //lv3
      const dataLv2 = await rp({
        'method': 'GET',
        'url':"https://open.sendo.vn/api/partner/category/"+ itemLv1.id,
        'headers': {
          'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYxNzY5ODc5OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.OD2auZ7MvFr6b78pSiUtTPgPsn-6o_M-X1Jo0AlAzjg'
        }
      })
      const listLv2 = JSON.parse(dataLv2).result
      listLv2.map(async itemLv2 =>{
        const cateLv2 = new SendoCategory({
          category_id: itemLv2.id,
          name: itemLv2.name.split("|")[1],
          idpath: [itemLv1.id, itemLv2.id],
          namepath: itemLv2.name.split("|")
        })
        await cateLv2.save() 
        //lv4
        const dataLv3 = await rp({
          'method': 'GET',
          'url':"https://open.sendo.vn/api/partner/category/"+ itemLv2.id,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYxNzY5ODc5OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.OD2auZ7MvFr6b78pSiUtTPgPsn-6o_M-X1Jo0AlAzjg'
          }
        })
        const listLv3 = JSON.parse(dataLv3).result
        listLv3.map(async itemLv3 =>{
          const cateLv3 = new SendoCategory({
            category_id: itemLv3.id,
            name: itemLv3.name.split("|")[2],
            idpath: [itemLv1.id, itemLv2.id,itemLv3.id],
            namepath: itemLv3.name.split("|"),
            leaf: true
          })
          await cateLv3.save()
        })
      })
  })
  res.send("done")
}
//create or update product
module.exports.createProductOnSendo = async (req, res) =>{
  //id = 0 -> create
  //id != 0 -> update
  
  const item = {id: 0, ...req.body};
  console.log(util.inspect(item.attributes, {showHidden: false, depth: null}))
  console.log(util.inspect(item.variants, {showHidden: false, depth: null}))
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
  request.get({url: `${process.env.API_URL}/api/sendo/product`}, function(error, response){
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

module.exports.printBill=  async (req, res) =>{
  const order_number = req.params.order_number
  try {
    const options = {
        'method': 'GET',
        'url': ' https://open.sendo.vn/api/partner/salesorder/bill/'+order_number,
        'headers': {
          'Authorization': 'bearer '+ req.accessToken
        }
      };
      res.send(options)
      // request(options, function (error, response) {
      //   if (error) throw new Error(error);
      //   //console.log(response.body);
      //   res.status(response.statusCode).send(response.body)
      // });
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
  request.get({url: `${process.env.API_URL}/api/sendo/order`}, function(error, response){
    const orders = JSON.parse(response.body)
    orders.forEach(e => {
      request.post({url: "http://localhost:5000/orders/sendo/create-order-sync",
                    json: e})
    });
    //console.log(storeName)
  })

  res.send("done")
}
// module.exports.updateProduct = async (req, res) => {
  
//   const items = req.body 
//   items.forEach(item => {
//     let Field_Mask = Object.keys(item)
//     //remove id
//     Field_Mask = Field_Mask.filter(e =>{
//       return e != "id"
//     })
//     //change field name
//     Field_Mask = Field_Mask.map((e, i) =>{
//       if(e === "StockQuantity"){
//         return Field_Mask[i] = "quantity"
//       }else{
//         return e
//       }
//     })
//     item.Field_Mask = Field_Mask

//     if(item.variants){
//       item.variants.forEach(variant => {
//         const field_mask = Object.keys(variant)
//         variant.field_mask = field_mask

//       });
//     }
//   });
//   //res.send(items)

//   try {
//       const options = {
//           'method': 'POST',
//           'url': 'https://open.sendo.vn/api/partner/product/update-by-field-mask',
//           'headers': {
//             'Authorization': 'bearer '+ req.accessToken
//           },
//           body: JSON.stringify(items)
//       };
//       //res.send(options)
//         request(options, function (error, response) {
//           if (error){
            
//             throw new Error(error);
            
//           } 
//           //console.log(response.body);
//           res.status(response.statusCode).send(response.body)
//         });
//   } catch (e) {
//       res.status(500).send(Error(e));
//   }
// }
module.exports.updateProduct = async (req, res) =>{
  const id =  req.body.id
  const item = req.body  //các field cần đc update
    //get full product on sendo
  const product = await rp({
      method: 'GET',
      uri: `${process.env.API_URL}/api/sendo/products/` + id,
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': req.accessToken
      },
      json: true
  })
  
  let trueProduct = product.result
 
  //change field name
  item["image"] = item["avatar"]

  if(item.variants){
    item.variants.forEach( (variant) =>{
      variant["variant_sku"] = variant["sku"]
      variant["variant_price"] = variant["price"]
      variant["variant_quantity"] = variant["quantity"]
      variant["variant_special_price"] = variant["special_price"]
      //find index of variant in trueProduct.variants
      
      const index = trueProduct.variants.findIndex(x => x.variant_attribute_hash === variant.variant_attribute_hash);

      
      //update variant
      if(index > -1)
      {
        trueProduct.variants[index] = variant
      }

      delete variant["sku"]
      delete variant["price"]
      delete variant["quantity"]
      delete variant["special_price"]
    })
  }
  
  //merge 2 product

  trueProduct = {
    ...trueProduct,
    name: item.name,
    sku:  item.sku,
    price: item.price,
    stock_quantity: item.stock_quantity, //you can change name
    stock_availability: item.stock_availability,
    unit_id: item.unitId,
    weight: item.weight
  }
  
  

  //res.send(trueProduct)
  // res.send(item)
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product/',
          'headers': {
            'Authorization': 'bearer '+ req.accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(trueProduct)
        };
        
      request(options, function (error, response) {
        if (error) throw new Error(error);

        // console.log(response.body)
        // console.log(response.statusCode)

        return res.status(response.statusCode).send(response.body)
          
        });
  } catch (e) {
      console.log("update sendo product failed: ", e.message)
      return res.status(500).send(Error(e));
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