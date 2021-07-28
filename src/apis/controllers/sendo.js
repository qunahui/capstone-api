const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');
const axios = require('axios').default;
const Storage = require('../models/storage')
const timeDiff = require('../utils/timeDiff')
const SendoCategory = require('../models/sendoCategory')
const ActivityLog = require('../models/activityLog')
const util = require('util');
const { urlencoded } = require("express");

const apiUrl = 'https://open.sendo.vn/api' 
const apiLoginUrl = 'https://open.sendo.vn/login'

module.exports.authorizeCredential = async (req, res) => {
  const { app_key, app_secret } = req.body
  const options = {
      method: 'POST',
      url: apiLoginUrl,
      header: {
        'Content-Type': 'application/json'
      },
      json: true,
      body: {
        shop_key: app_key,
        secret_key: app_secret
      }
  }
  try {
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

      await new ActivityLog({
        storageId: req.user.currentStorage.storageId, 
        userId: req.user._id,
        userName: req.user.displayName,
        userRole: req.user.role,
        message: 'Đồng bộ gian hàng ' + insertCredential.store_name,
      }).save()

      return res.status(200).send(insertCredential)
    }).catch(e => {
      console.log("Response: ", e.message)
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
    const { app_key, app_secret } = credential
    const timeDifference = timeDiff(new Date(), new Date(credential.expires))
    const isTokenAvailable = timeDifference.hoursDifference < 0 ? true : timeDifference.minutesDifference <= 0 ? true : false

    if(isTokenAvailable === true) {
      return res.status(200).send({
        ...credential,
        isCredentialRefreshed: false
      })
    }
    const options = {
      method: 'POST',
      url: apiLoginUrl,
      header: {
        'Content-Type' : 'application/json'
      },
      json: true,
      body: {
        shop_key: app_key,
        secret_key: app_secret
      }
    }
    try {
      console.log("try refresh sendo token")
      const response = await rp(options)
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

module.exports.getCategory = async (req, res) =>{
  //category lv4 have attributes but useless
  const categoryId = req.params.id; // start from 0
  const apiPath=  '/partner/category/'
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${categoryId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options).then(response=> res.status(200).send(response.result))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.createSendoCategory = async (req, res) =>{
  const apiPath=  '/partner/category/'
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    const listLv1 = await rp({...options, url: `${apiUrl}${apiPath}0`}).then(res => res.result)
    listLv1.map( async itemLv1 =>{
        //lv2
        await new SendoCategory({
          category_id: itemLv1.id,
          name: itemLv1.name,
          idpath: [itemLv1.id],
          namepath: [itemLv1.name]
        }).save()
        //lv3
        const listLv2 = await rp({...options,url: `${apiUrl}${apiPath}${itemLv1.id}`}).then(res => res.result)
        listLv2.map(async itemLv2 =>{
          await new SendoCategory({
            category_id: itemLv2.id,
            name: itemLv2.name.split("|")[1],
            idpath: [itemLv1.id, itemLv2.id],
            namepath: itemLv2.name.split("|")
          }).save()
          //lv4
          const listLv3 = await rp({...options,url: `${apiUrl}${apiPath}${itemLv2.id}`}).then(res => res.result)
          listLv3.map(async itemLv3 =>{
            await new SendoCategory({
              category_id: itemLv3.id,
              name: itemLv3.name.split("|")[2],
              idpath: [itemLv1.id, itemLv2.id,itemLv3.id],
              namepath: itemLv3.name.split("|"),
              leaf: true
            }).save()
          })
        })
    })
    res.send("done")
  } catch (error) {
    res.status(500).send(Error(e));
  }
}
//create or update product
module.exports.createProduct = async (req, res) =>{
  //id = 0 -> create
  //id != 0 -> update
  
  const item = {id: 0, ...req.body};
  //console.log(util.inspect(item.attributes, {showHidden: false, depth: null}))
  //console.log(util.inspect(item.variants, {showHidden: false, depth: null}))
  const apiPath = '/partner/product'
  const options = {
    method: 'POST',
    url: `${apiUrl}${apiPath}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken,
      'Content-Type': 'application/json'
    },
    body: item,
    json: true
  };
  try {    
    //console.log(options)
    await rp(options).then(response=> res.status(200).send(response))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getAttribute = async (req, res) =>{
  const apiPath = '/partner/category/attribute/'
  const catgoryId = req.params.categoryId; // category cuoi cung
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${catgoryId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getProductById = async (req, res) =>{
  const apiPath = '/partner/product'
  const productId = req.params.id;
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}?id=${productId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    //console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.searchProduct = async (req, res) =>{
  //filter product, search by name, date_from, date_to
  //if nothing-> get all
  const apiPath ='/partner/product/search'
  const pageSize = req.query.page_size || 100
  const productName = req.query.product_name || ""
  const dateFrom = req.query.date_from || "2020-05-01"
  const dateTo = req.query.date_to || "9999-10-28"
  const token = req.query.token ? decodeURIComponent(req.query.token) :  ""
  const options = {
    method: 'POST',
    url: `${apiUrl}${apiPath}`,
    headers: {
      Authorization: 'bearer ' + req.accessToken,
      'Content-Type': 'application/json',
      'cache-control': 'no-cache'
    },
    body: { //axios là data
      page_size: pageSize,
      product_name: productName,
      date_from: dateFrom,
      date_to: dateTo,
      token: token
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.searchOrder=  async (req, res) =>{
  //filter order, search by name, date_from, date_to
  //if nothing-> get all
  const apiPath ='/partner/salesorder/search'
  const pageSize = req.query.page_size || 100
  const orderStatus = req.query.order_status || null
  const orderDateFrom = req.query.date_from || "2021-01-01"
  const orderDateTo = req.query.date_to || "2021-10-28"
  const orderStatusDateFrom = req.query.order_status_date_from || ""
  const orderStatusDateTo = req.query.order_status_date_to || ""
  const token = req.query.token ? decodeURIComponent(req.query.token) :  ""
  const options = {
    method: 'POST',
    url: `${apiUrl}${apiPath}`,
    headers: {
      Authorization: 'bearer ' + req.accessToken,
      'Content-Type': 'application/json',
      'cache-control': 'no-cache'
    },
    body: { //axios là data
      page_size: pageSize,
      order_status: orderStatus,
      order_date_from: orderDateFrom,
      order_date_to: orderDateTo,
      order_status_date_from: orderStatusDateFrom,
      order_status_date_to: orderStatusDateTo,
      token: token
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result.data))
    .catch(error => res.status(error.statusCode).send(error.error))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  } 
}

module.exports.getCancelReason =  async (req, res) =>{
  const apiPath = '/partner/salesorder/reason-collection'
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.printBill = async (req, res) =>{
  const apiPath ='/partner/salesorder/bill/'
  const order_number = req.params.order_number
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${order_number}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))

    // await axios(options)
    // .then(response=> res.status(200).send(response.data.result))
    // .catch(error => res.status(400).send(error))
  } catch (e) {
    console.log("print bill failed: ", e.message)
    res.status(500).send(Error(e));
  }
}

module.exports.updateOrderStatus = async (req, res) => {
  // order status
  // 3: confirm order (be careful, dont use)
  //13: cancel order (include reason)
  const apiPath = '/partner/salesorder'
  const orderNumber = req.params.id
  const orderStatus = req.body.orderStatus || null
  const cancelReason = req.body.cancelReason || ''
  const options = {
    method: 'PUT',
    url: `${apiUrl}${apiPath}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken,
      'Content-Type': 'application/json',
      'cache-control': 'no-cache'
    },
    body:{
      order_number: orderNumber,
      order_status: orderStatus,
      cancel_order_reason: cancelReason
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))

    // await axios(options)
    // .then(response=> res.status(200).send(response.data.result))
    // .catch(error => res.status(400).send(error))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getOrderById = async (req, res) => {
  const apiPath = '/partner/salesorder/'
  const orderId = req.params.id;
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${orderId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))

    // await axios(options)
    // .then(response=> res.status(200).send(response.data.result))
    // .catch(error => res.status(400).send(error))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.updateProduct = async (req, res) =>{
  const apiPath = '/partner/product'
  const productId =  req.body.id
  const item = req.body  //các field cần đc update
    //get full product on sendo
  const options = {
    method: 'GET',
    url: `${process.env.API_URL}/api/sendo/products/${productId}`,
    headers: {
      Authorization: 'Bearer ' + req.mongoToken,
      'Platform-Token': req.accessToken
    },
    json: true
  }
  try {
    const product = await axios(options).then(res => res.data).catch(err => console.log(err))
    if(item.variants){
      item.variants.map( (variant) =>{
        variant["variant_sku"] = variant["sku"]
        variant["variant_price"] = variant["price"]
        variant["variant_quantity"] = variant["quantity"]
        variant["variant_special_price"] = variant["special_price"]
        //find index of variant in product.variants
        const index = product.variants.findIndex(x => x.variant_attribute_hash === variant.variant_attribute_hash);
        //update variant
        if(index > -1){
          product.variants[index] = variant
        }
        delete variant["sku"]
        delete variant["price"]
        delete variant["quantity"]
        delete variant["special_price"]
      })
    }
    
    //merge 2 product
  
    const mergeProduct = {
      ...product,
      name: item.name,
      sku:  item.sku,
      price: item.price,
      stock_quantity: item.stock_quantity, //you can change name
      stock_availability: item.stock_availability,
      unit_id: item.unitId,
      weight: item.weight
    }

    const updateOptions = {
      method: 'POST',
      url: `${apiUrl}${apiPath}`,
      headers: {
        Authorization: 'bearer ' + req.accessToken,
        'Content-Type': 'application/json'
      },
      body: mergeProduct,
      json: true
    }
    
    await rp(updateOptions)
    .then(response => res.send(response))
    .catch(error => console.log(error))

  } catch (e) {
    console.log("update sendo product failed: ", e.message)
    return res.status(500).send(Error(e));
  }
}

module.exports.deleteProduct = async (req, res) => {
  const apiPath = '/partner/product/update-by-field-mask'
  const productId = req.params.id;
  const options = {
    method: 'POST',
    url: `${apiUrl}${apiPath}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken,
      'Content-Type': 'application/json'
    },
    body: //axios là data
      [
        {
        id: productId,
        product_status: 5,
        stock_availability: false,
        Field_Mask: ["product_status", "stock_availability"]
        }
      ],
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then((response) => {
      //console.log(response.result)
      if(response.result.success === true){
        res.sendStatus(200)
      }
    })
    .catch(error => res.status(500).send(Error(error)))
  } catch (e) {
    res.status(500).send(Error(e));
  }
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

module.exports.syncAllOrderSendo = async (req, res) =>{
  request.get({url: `${process.env.API_URL}/api/sendo/order`}, function(error, response){
    const orders = JSON.parse(response.body)
    orders.forEach(e => {
      request.post({url: `${process.env.API_URL}/orders/sendo/create-order-sync`,
                    json: e})
    });
    //console.log(storeName)
  })

  res.send("done")
}

module.exports.getWardById = async (req, res) =>{
  const apiPath=  '/address/ward/'
  const wardId = req.params.id;
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${wardId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options).then(response=> res.status(200).send(response.result))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getDistrictById = async (req, res) =>{
  const apiPath=  '/address/district/'
  const districtId = req.params.id;
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${districtId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    }
  };
  try {
    console.log(options)
    await rp(options).then(response=> res.status(200).send(response.result))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.getRegionById = async (req, res) =>{
  const apiPath=  '/address/region/'
  const regionId = req.params.id;
  const options = {
    method: 'GET',
    url: `${apiUrl}${apiPath}${regionId}`,
    headers: {
      Authorization: 'bearer '+ req.accessToken
    },
    json: true
  };
  try {
    console.log(options)
    await rp(options)
    .then(response=> res.status(200).send(response.result))
    .catch(error => res.status(error.statusCode).send(error.error))
    //await axios(options).then(response=> res.status(200).send(response.data.result))
  } catch (e) {
    res.status(500).send(Error(e));
  }
}