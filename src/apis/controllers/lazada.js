const crypto = require('crypto')
var request = require('request');
var convert = require('xml-js');
const fs = require('fs');
var options = {compact: true, ignoreComment: true, spaces: 4};


const keysort = (unordered) => {
    return Object.keys(unordered)
        .sort()
        .reduce((ordered, key) => {
            ordered[key] = unordered[key]
            return ordered
        }, {})
}
const concatDictionaryKeyValue = (object) => {
    return Object.keys(object).reduce(
        (concatString, key) => concatString.concat(key + object[key]),
        '',
    )
}
module.exports.signRequest = (appSecret, apiPath, params) => {
    const keysortParams = keysort(params)
    const concatString = concatDictionaryKeyValue(keysortParams)
    const preSignString = apiPath + concatString
    const hash = crypto
        .createHmac('sha256', appSecret)
        .update(preSignString)
        .digest('hex')

    return hash.toUpperCase()
}
module.exports.createSign = async (req, res) => {
    const appSecret = req.body.appSecret
    const apiPath = req.body.apiPath
    const params = req.body.params
    const keysortParams = keysort(params)

    const concatString = concatDictionaryKeyValue(keysortParams)

    const preSignString = apiPath + concatString

    const hash = crypto
        .createHmac('sha256', appSecret)
        .update(preSignString)
        .digest('hex')

    res.send(hash.toUpperCase()) 
    //res.send("hello")
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
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, filter})
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
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, item_id})
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
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, primary_category_id})
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
            const attribute = JSON.parse(response.body)
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
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, offset, limit})
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
    const sign = this.signRequest(appSecret, apiPath, {...commonRequestParams, product_name})
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

    const sign = this.signRequest(appSecret, apiPath, commonRequestParams)
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

module.exports.migrateImage = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/image/migrate'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
    const timestamp = Date.now()
    const request = req.body
    const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(request, {compact: true, ignoreComment: true, spaces: 4})
    
    const commonRequestParams = {
        "app_key": appKey,
        "timestamp": timestamp,
        "sign_method": "sha256",
        "access_token":accessToken
    }

    const sign = this.signRequest(appSecret, apiPath, commonRequestParams)
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
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
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
//setStatusToCancel
module.exports.cancelOrder = async (req, res) =>{
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/order/cancel'
    const appSecret = "JPqQSDANG14eZdPtMogRDjiNwGYGj8wz" // goi db
    const appKey = 122845 // goi db
    const accessToken =  "500005000282pCawUSfbySlxELBNZvxde1hVjqrd1c60dd3csukWdjU9syzPtBwi" // goi db
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