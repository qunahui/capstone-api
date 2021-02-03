const crypto = require('crypto')
const { signRequest } = require('../utils/laz-sign-request')
var request = require('request');
const rp = require('request-promise');
var convert = require('xml-js');
const fs = require('fs');
const path = require('path')
const server = require('../../app')
const Storage = require('../models/storage');
const { createLazadaProduct } = require('./lazadaProduct');
const LazadaProduct = require('../models/lazadaProduct');
const Error = require('../utils/error')

var options = {compact: true, ignoreComment: true, spaces: 4};

module.exports.authorizeCredential = async (req, res) => {
  try {
    const { code, state } = req.query
    if(req.query) {
      const result = await rp({
        method: 'GET',
        uri: 'http://localhost:5000/api/lazada/token?code='+ code + '&state=' + state,
      })
      console.log(result)
      console.log("Result: ", JSON.parse(result))
      const { access_token, name, store_id, storageId } = JSON.parse(result)

      res.status(200).send({ name, storageId, store_id, access_token })
    }
  } catch(e) {
    res.status(500).send(Error({ message: 'Something went wrong' }))
  }
}

module.exports.getAccessToken = async (req, res) => {
    const apiUrl = 'https://auth.lazada.com/rest' 
    const apiPath=  '/auth/token/create'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY 
    const {code, state} =  req.query 
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "code":code,
        "state": state
    }
    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    try {
        let options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&code='+code+
            '&state='+state+
            '&sign_method=sha256&timestamp='+timestamp+
            '&sign='+sign,
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        const response = await rp(options).then(res => JSON.parse(res));
        if(response.code === '0') {
          //if no error return
          const [uid, storageId] = state.split('_')
          const storage = await Storage.findById(storageId)
          const insertCredentials = {
              store_name: response.name,
              platform_name: 'lazada',
              refresh_token: response.refresh_token,
              access_token: response.access_token,
              isActivated: true,
          }
          const result = await rp.post({
              method: 'POST',
              uri: 'http://localhost:5000/api/lazada/seller',
              body: { access_token: response.access_token },
              json: true
          }).then(res => res.data)
          const { name, seller_id } = result 
          insertCredentials.store_name = name
          insertCredentials.store_id = seller_id
          if(storage.lazadaCredentials.length === 0) {
              storage.lazadaCredentials = [insertCredentials]
          } else {
              storage.lazadaCredentials = storage.lazadaCredentials.map(i => {
                  if(i.store_name === name) {
                      return insertCredentials
                  }
                  return i
              })
          }
          await Storage.findOneAndUpdate({ id: storageId }, storage, {}, (err, doc) => {
              res.status(200).send({ access_token: insertCredentials.access_token, name, store_id: insertCredentials.store_id, storageId })
          })
        } else {
          // error return from lazada
          res.status(500).send(Error({ message: 'Something went wrong' }))
        }
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.refreshToken = async (req, res) =>{
    const store_id = req.query.store_id
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/auth/token/refresh'
    const appSecret = process.env.LAZADA_APP_SECRET 
    const appKey = process.env.LAZADA_APP_KEY 
    const refresh_token =  req.refreshToken
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "refresh_token":refresh_token
    }
    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&refresh_token='+refresh_token+
            '&sign='+sign,
            'headers': {
            }
        };
        //res.send(options)
        request(options, async function (error, response) {
            if (error) throw new Error(error);
            
            const {access_token, refresh_token} = JSON.parse(response.body)
            const storages =  await Storage.find({"lazadaCredentials.store_id": store_id})
            
            storages.forEach( async (storage)=>{
                storage.lazadaCredentials.forEach( (store) => {
                    if(store.store_id == store_id)
                    {
                        
                        store.access_token = access_token
                        store.refresh_token = refresh_token
                    }
                });
                await Storage.update({_id: storage._id}, storage, { upsert: true})
            })
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//1: lazada product api
module.exports.getAllProducts = async (req, res) => {
    console.log(req.query)
    try {
        const { store_id } = req.query;
        const lazadaProducts = await LazadaProduct.find({ store_id })
    
        console.log(lazadaProducts)

        res.status(200).send(lazadaProducts)
      } catch(e) {
        res.status(500).send(Error({ message: 'Something went wrong !'}))
    }
}

module.exports.fetchProducts = async (req, res) =>{
    console.log(req.body)
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/products/get'
    const appSecret = process.env.LAZADA_APP_SECRET 
    const appKey = process.env.LAZADA_APP_KEY 
    const accessToken =  req.body.access_token
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const filter = req.body.filter
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, filter})
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?filter='+filter+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        const { data } = await rp(options).then(res => JSON.parse(res))
        console.log("data: ", data)
        const { products } = data
        await Promise.all(products.map(async product => await createLazadaProduct(product, { store_id: req.body.store_id })))
    } catch (e) {
        res.status(500).send(Error(e));
    }
    const lazadaProducts = await LazadaProduct.find({ storageId: req.body.storageId, store_id: req.body.store_id })
    res.status(200).send(lazadaProducts)
}
//not use yet
module.exports.getProductById = async (req, res) =>{
    const store_id=  req.query.store_id
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/item/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY 
    let accessToken =  "" // goi db
    const storage =  await Storage.findOne({"lazadaCredentials.store_id": store_id}, {lazadaCredentials: 1})
    
    
    storage.lazadaCredentials.forEach(store => {
        if(store.store_id == store_id)
        {
            accessToken = store.access_token
        }
    });
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const item_id = req.params.id
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, item_id})
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?item_id='+item_id+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const product = JSON.parse(response.body)
            res.send(product)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//not use yet
module.exports.getCategoryTree = async (req, res) =>{
    // no need access_token
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/category/tree/get'
    const appSecret = process.env.LAZADA_APP_KEY 
    const appKey = process.env.LAZADA_APP_KEY 
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const categoryTree = JSON.parse(response.body)
            res.send(categoryTree)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getAttributes = async (req, res) =>{
    // no need access_token
    // use primary_category_id( final category ex: 10100183)
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/category/attributes/get'
    const appSecret = process.env.LAZADA_APP_SECRET 
    const appKey = process.env.LAZADA_APP_KEY 
    //const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const primary_category_id = req.params.id
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        //"access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, primary_category_id})
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?primary_category_id='+ primary_category_id+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            //'&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log(response.body);
            const attribute = JSON.parse(response.body).data
            if(attribute)
            {
                res.status(200).send(attribute)
            }else
            {
                res.status(404).send(response.body)
            }
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//not use yet
module.exports.getBrands = async (req, res) =>{
    // no need access_token
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/brands/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    //const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const offset = req.query.offset
    const limit = req.query.limit
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        //"access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, offset, limit})
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?offset='+ offset+
            '&limit='+limit+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            //'&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const brands = JSON.parse(response.body)
            res.send(brands)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
// not working
module.exports.getCategorySuggestion = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/category/suggestion/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const product_name = req.query.name
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, product_name})
    const encodeProductName = encodeURI(product_name)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?product_name='+encodeProductName+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log(response.body);
            const suggestion = JSON.parse(response.body)
            res.send(suggestion)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}
// req: seller_sku -> res: QCstatus (approved or rejected)
module.exports.getQcStatus = async (req, res) =>{
    const store_id = req.query.store_id 
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/qc/status/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    let accessToken =  "" // goi db
    const timestamp = Date.now()
    const offset = req.query.offset
    const limit = req.query.limit
    const seller_skus = JSON.stringify(req.body.seller_skus)
    const storage =  await Storage.findOne({"lazadaCredentials.store_id": store_id}, {lazadaCredentials: 1})
    
    
    storage.lazadaCredentials.forEach(store => {
        if(store.store_id == store_id)
        {
            accessToken = store.access_token
        }
    });
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, offset, limit, seller_skus})
    const encodeSellerSkus = encodeURI(seller_skus)

   
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?offset='+offset+
            '&limit='+limit+
            '&seller_skus='+encodeSellerSkus+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //res.send(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log(response.body);
            const QcStatus = JSON.parse(response.body)
            if(QcStatus.code == "1006")
                res.status(404).send(QcStatus)
            res.status(200).send(QcStatus)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}
module.exports.uploadImage = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/image/upload'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()

    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }

    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    //console.log(req.file)
    try {
        
        var options = {
            'method': 'POST',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            formData:{
                'image': {
                'value': fs.createReadStream(req.file.path),
                'options': {
                  'filename': req.file.path,
                  'contentType': null
                }
              }}
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log(response.body);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.updateProduct = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/update'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const data = {
        "Request": {
            "Product": {
                "Skus": {
                    "Sku": [
                        {
                            "SellerSku": req.params.sellerSku,
                            ...req.body
                        }
                    ]   
                }
            }
        }
    }
    const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(data, {compact: true, ignoreComment: true, spaces: 4})
    
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, payload})
    const encodePayload = encodeURI(payload)
    try {
        var options = {
            'method': 'POST',
            'url': apiUrl+apiPath+
            '?payload='+encodePayload+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}

module.exports.createProductOnLazada = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/create'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const data = req.body
    const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(data, {compact: true, ignoreComment: true, spaces: 4})
    
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, payload})
    const encodePayload = encodeURI(payload)
    try {
        var options = {
            'method': 'POST',
            'url': apiUrl+apiPath+
            '?payload='+encodePayload+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}

module.exports.deleteProduct = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/remove'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const seller_sku_list= JSON.stringify([req.params.sellerSku])
    //console.log(seller_sku_list)
    
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, seller_sku_list})

    const encodeSkuList = encodeURI(seller_sku_list)
    try {
        var options = {
            'method': 'POST',
            'url': apiUrl+apiPath+
            '?seller_sku_list='+encodeSkuList+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}
//2: lazada seller API
module.exports.getSellerInfo = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/seller/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.body.access_token 
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        request(options, function (error, response) {
            const r = JSON.parse(response.body)
            res.send(r)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//Provide seller metrics data of the specific seller, like positive seller rating, ship on time rate and etc.
module.exports.getSellerMetrics = async (req, res) =>{
    const store_id = req.query.store_id
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/seller/metrics/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    let accessToken = ""
    const storage =  await Storage.findOne({"lazadaCredentials.store_id": store_id}, {lazadaCredentials: 1})
    
    
    storage.lazadaCredentials.forEach(store => {
        if(store.store_id == store_id)
        {
            accessToken = store.access_token
        }
    });
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const sellerMetrics = JSON.parse(response.body)
            res.send(sellerMetrics)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
// not working
module.exports.updateSellerEmail = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/seller/update'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const data = req.body
    const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(data, {compact: true, ignoreComment: true, spaces: 4})
    console.log(payload)
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, payload})
    const encodePayload = encodeURI(payload)
    try {
        var options = {
            'method': 'POST',
            'url': apiUrl+apiPath+
            '?payload='+encodePayload+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log(response.body);
            //const res = JSON.parse(response.body)
            res.send(JSON.parse(response.body))
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}

//3: lazada order API
module.exports.getCancelReason = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/failure_reason/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, commonRequestParams)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.searchOrder = async (req, res) =>{
    //must have created_before or created_after
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/orders/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const created_after = req.query.created_after
    //const status = req.query.status
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, created_after})
    const encodeCreateAfter = encodeURIComponent(created_after)
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?created_after='+encodeCreateAfter+
            //'&status='+status+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        console.log(options)
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const orders = JSON.parse(response.body)
            res.send(orders)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getOrderByIdOnLazada = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const order_id = req.params.id
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, order_id})
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?order_id='+order_id+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getOrderItems = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/items/get'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const order_id = req.params.id
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, order_id})
    try {
        var options = {
            'method': 'GET',
            'url': apiUrl+apiPath+
            '?order_id='+order_id+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //res.send(response.body)
            const listItem = JSON.parse(response.body).data
            listItem.forEach(item => {
                item.quantity = 1
                item.store_sku = item.sku
            });
            var i,m =0
            for(i =1;i < listItem.length;i++)
            {
                if(listItem[m].sku === listItem[i].sku)
                {
                    listItem[m].quantity++
                    listItem.splice(i,1)
                    i--
                }
                else{
                    m = i
                }
            }
            res.status(200).send(listItem)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//setStatusToCancel
module.exports.cancelOrderOnLazada = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/cancel'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const reason_detail = req.body.reason_detail // not required
    const reason_id = req.body.reason_id
    const order_item_id = req.params.id
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, reason_id, order_item_id})
    try {
        var options = {
            'method': 'POST',
            'url': apiUrl+apiPath+
            '?reason_id='+reason_id+
            '&order_item_id='+ order_item_id+
            '&app_key='+appKey+
            '&sign_method=sha256&timestamp='+timestamp+
            '&access_token='+accessToken+
            '&sign='+sign,
            'headers': {
            }
        };
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            res.status(response.statusCode).send(response.body)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}