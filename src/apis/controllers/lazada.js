const crypto = require('crypto')
const { signRequest } = require('../utils/laz-sign-request')
var request = require('request');
const rp = require('request-promise');
const fs = require('fs');
const server = require('../../app')
const Storage = require('../models/storage')
var options = {compact: true, ignoreComment: true, spaces: 4};

module.exports.getAccessToken = async (req, res) => {
    const apiUrl = 'https://auth.lazada.com/rest' 
    const apiPath=  '/auth/token/create'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const {code, state} =  req.query // goi db
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
        const [uid, storageId] = state.split('_')
        const storage = await Storage.findById(storageId)
        const insertCredentials = {
            store_name: response.name,
            platform_name: 'lazada',
            refresh_token: response.refresh_token,
            uid,
            access_token: response.access_token
        }
        console.log("Inserted: ", insertCredentials)
        storage.lazadaCredentials.push(insertCredentials)

        await storage.save()

        let io = server.getIO()
        io.sockets.emit('laz auth success', {access_token})
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.refreshToken = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/auth/token/refresh'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const refresh_token =  req.params.refresh_token // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "refresh_token":refresh_token
    }
    const sign = this.signRequest(appSecret, apiPath, commonRequestParams)
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
        //console.log(options)
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const r = JSON.parse(response.body)
            res.send(r)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.searchProduct = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/products/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const filter = req.query.filter
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
        request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const products = JSON.parse(response.body)
            res.send(products)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getProductById = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/item/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
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

module.exports.getCategoryTree = async (req, res) =>{
    // no need access_token
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/category/tree/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
            //if (error) throw new Error(error);
            //console.log(response.body);
            const attribute = JSON.parse(response.body).data
            res.send(attribute)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getBrands = async (req, res) =>{
    // no need access_token
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/brands/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
module.exports.getCategorySuggestion = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/category/suggestion/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
module.exports.getQcStatus = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/qc/status/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const offset = req.query.offset
    const limit = req.query.limit
    const seller_skus = req.query.seller_skus
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, offset, limit, seller_skus})
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
        //console.log(options)
        request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log(response.body);
            const QcStatus = JSON.parse(response.body)
            res.send(QcStatus)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}
module.exports.getSellerInfo = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/seller/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
            const sellerInfo = JSON.parse(response.body)
            res.send(sellerInfo)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getSellerMetrics = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/seller/metrics/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
            const sellerMetrics = JSON.parse(response.body)
            res.send(sellerMetrics)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.updateSellerEmail = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/seller/update'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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

module.exports.uploadImage = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/image/upload'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
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
            const image = JSON.parse(response.body)
            res.send(image)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.updateProduct = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/update'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const data = req.body
    const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(data, {compact: true, ignoreComment: true, spaces: 4})
    
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, payload})
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
            //console.log(response.body);
            //const res = JSON.parse(response.body)
            res.send(JSON.parse(response.body))
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}

module.exports.createProduct = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/create'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const data = req.body
    const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(data, {compact: true, ignoreComment: true, spaces: 4})
    
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, payload})
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
            //console.log(response.body);
            //const res = JSON.parse(response.body)
            res.send(JSON.parse(response.body))
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}
module.exports.removeProduct = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/product/remove'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const seller_sku_list= JSON.stringify(req.body.seller_sku_list)
    //console.log(seller_sku_list)
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, seller_sku_list})

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
            //console.log(response.body);
            //const res = JSON.parse(response.body)
            res.send(JSON.parse(response.body))
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}

module.exports.getCancelReason = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/failure_reason/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = this.signRequest(appSecret, apiPath, commonRequestParams)
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
            const CancelReason = JSON.parse(response.body)
            res.send(CancelReason)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.searchOrder = async (req, res) =>{
    //must have created_before or created_after
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/orders/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
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
module.exports.getOrderById = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/get'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "50000500616qprrLfVCiIv3txDaY1de855c0J2klvctQjfdeq9srvlKjRn1Q4Qme" // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const order_id = req.params.id
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, order_id})
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
            //if (error) throw new Error(error);
            //console.log(response.body);
            const order = JSON.parse(response.body)
            res.send(order)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getOrderItem = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/items/get/new'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "50000500616qprrLfVCiIv3txDaY1de855c0J2klvctQjfdeq9srvlKjRn1Q4Qme" // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken,
    }
    const order_id = req.params.id
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, order_id})
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
            //if (error) throw new Error(error);
            //console.log(response.body);
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
            res.send(listItem)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//setStatusToCancel
module.exports.cancelOrder = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/cancel'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "50000500616qprrLfVCiIv3txDaY1de855c0J2klvctQjfdeq9srvlKjRn1Q4Qme" // goi db
    const timestamp = Date.now()
    const reason_detail = req.body.reason_detail // not required
    const reason_id = req.body.id
    const order_item_id = req.body.order_id
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, reason_id, order_item_id})
    try {
        var options = {
            'method': 'GET',
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
            //if (error) throw new Error(error);
            //console.log(response.body);
            const cancelOrder = JSON.parse(response.body)
            res.send(cancelOrder)
        });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}