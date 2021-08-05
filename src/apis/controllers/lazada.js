const { signRequest } = require('../utils/laz-sign-request')
var request = require('request');
const axios = require('axios').default;
const rp = require('request-promise');
var convert = require('xml-js');
const fs = require('fs');
const Storage = require('../models/storage');
const { createLazadaProduct } = require('./lazadaProduct');
const LazadaProduct = require('../models/lazadaProduct');
const Error = require('../utils/error')
const timeDiff = require('../utils/timeDiff')
const util = require('util')
const ActivityLog = require('../models/activityLog')

const { LazadaRequest, LazadaClient } = require('lazada-sdk-client');

const apiUrl = 'https://api.lazada.vn/rest' 
const appSecret = process.env.LAZADA_APP_SECRET 
const appKey = process.env.LAZADA_APP_KEY
const signMethod = 'sha256' 
const client = new LazadaClient(apiUrl, appKey, appSecret)

var payloadOptions = {compact: true, ignoreComment: true, spaces: 0};

module.exports.authorizeCredential = async (req, res) => {
    try {
        const { code } = req.query
        const apiPath=  '/auth/token/create'
        const timestamp = Date.now()
        const { storageId } = req.user.currentStorage
        const commonRequestParams = {
            app_key: appKey,
            timestamp: timestamp,
            sign_method: signMethod,
            code: code,
        }
        const sign = signRequest(appSecret, apiPath, commonRequestParams)
        let options = {
            method: 'GET',
            url: `https://api.lazada.com.my/rest${apiPath}?app_key=${appKey}&code=${code}&sign_method=${signMethod}&timestamp=${timestamp}&sign=${sign}`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: true
        };
        const response = await rp(options);
        if(response.code === '0') {
            console.log(response)
            const insertCredential = {
            // store_name: response.name,
                platform_name: 'lazada',
                refresh_token: response.refresh_token,
                access_token: response.access_token,
                expires: new Date(new Date().getTime() + response.expires_in*1000),
                refresh_expires: new Date(new Date().getTime() + response.refresh_expires_in*1000),
                status: 'connected',
                isActivated: true,
            }

        const result = await rp.get({
            uri: `${process.env.API_URL}/api/lazada/seller`,
            headers:{ 
                Authorization: 'Bearer ' + req.mongoToken,
                "Platform-Token": response.access_token
            },
            json: true
        })
        .catch(e => e.message)

        const { name, seller_id } = result 
        insertCredential.store_name = name
        insertCredential.store_id = seller_id

        const storage = await Storage.findOne({ _id: storageId })
        if(storage.lazadaCredentials.length === 0) {
            storage.lazadaCredentials = [insertCredential]
        } else {
            storage.lazadaCredentials = storage.lazadaCredentials.map(i => {
                if(i.store_name === insertCredential.store_name) {
                    return insertCredential
                }
                return i
            })
        }

        await Storage.findOneAndUpdate({
            _id: storageId
        }, {
            lazadaCredentials: storage.lazadaCredentials
        })

        await new ActivityLog({
            storageId: req.user.currentStorage.storageId, 
            userId: req.user._id,
            userName: req.user.displayName,
            userRole: req.user.role,
            message: 'Đồng bộ gian hàng ' + insertCredential.store_name,
        }).save()

        res.status(200).send(insertCredential)
        } else {
            // error return from lazada
            res.status(500).send(Error({ message: JSON.stringify({ response, options}) }))
        }
    } catch (e) {
        console.log("authorize lazada failed: ", e.message)
        res.status(500).send(Error(e));
    }
}

module.exports.getAccessToken = async (req, res) => {
    const credential = req.body.credential

    if(credential) {
        const timeDifference = timeDiff(new Date(), new Date(credential.expires))
        const isTokenAvailable = timeDifference.hoursDifference <= 0

        if(isTokenAvailable === true) {
            console.log("using old lazada token")
            return res.status(200).send({
                ...credential,
                isCredentialRefreshed: false
            })
        }
    }

    console.log("try refresh new lazada token")

    try {
        const newCredential = await rp({
            method: 'POST',
            url: `${process.env.API_URL}/api/lazada/refresh-token`,
            headers: {
                Authorization: "Bearer " + req.mongoToken
            },
            json: true,
            body: {
                credential
            }
        })

        return res.status(200).send({
            ...newCredential,
            isCredentialRefreshed: false
        })
    } catch(e) {
        console.log("Refresh token failed: ", e.message)
        res.status(500).send(Error({ message: "Lấy token lazada thất bại !"}))
    }
}

module.exports.refreshToken = async (req, res) =>{
    const apiPath=  '/auth/token/refresh'
    const { storageId } = req.user.currentStorage
    const { credential } = req.body
    const { refreshToken, refreshExpires } = credential
    const timestamp = Date.now()
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        refresh_token: refreshToken
    }
    try {
        if(timeDiff(new Date(), new Date(refreshExpires)).hoursDifference > 0) {
            return res.status(200).send({
                ...credential,
                isRefreshExpired: true,
            })
        }
        const sign = signRequest(appSecret, apiPath, commonRequestParams)
        const options = {
            method: 'GET',
            url: `${apiUrl}${apiPath}?app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&refresh_token=${refreshToken}&sign=${sign}`,
            json: true
        };
        console.log(options)
        const data = await rp(options)
        const { access_token, refresh_token, expires_in } = data
        await Storage.updateOne({ 
            _id: storageId,
            lazadaCredentials: {
                $elemMatch: {
                    _id: credential._id,
                    store_id: credential.store_id
                }
            }
        } , {
            $set: {
                "lazadaCredentials.$.access_token": access_token,
                "lazadaCredentials.$.refresh_token": refresh_token,
                "lazadaCredentials.$.expires": new Date(new Date().getTime() + expires_in*1000),
            }
        })

        return res.status(200).send({
            data,
            isRefreshExpired: false
        })
    } catch (e) {
        return res.status(500).send(Error(e));
    }
}

module.exports.getProductById = async (req, res) =>{
    const apiPath=  '/product/item/get'
    const accessToken =  req.accessToken
    const item_id = req.params.id
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("item_id", item_id); // http method default is post
        const response = await client.execute(request, accessToken);
        const { data } = response.data
    
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getProductBySellerSku= async (req, res) =>{
    const apiPath=  '/product/item/get'
    const seller_sku = req.params.id
    const accessToken =  req.accessToken
    const client = new LazadaClient(apiUrl, appKey, appSecret)
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("seller_sku", seller_sku); // http method default is post
        const response = await client.execute(request, accessToken);
        const { data } = response.data
        
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

// req: seller_sku -> res: QCstatus (approved or rejected)
module.exports.getQcStatus = async (req, res) =>{
    const apiPath=  '/product/qc/status/get'
    const accessToken =  req.accessToken
    const timestamp = Date.now()
    const offset = req.query.offset
    const limit = req.query.limit
    const seller_skus = JSON.stringify(req.body.seller_skus)
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }
    try {
        const sign = signRequest(appSecret, apiPath, {...commonRequestParams, offset, limit, seller_skus})
        const encodeSellerSkus = encodeURI(seller_skus)
        const options = {
            method: 'GET',
            url: `${apiUrl}${apiPath}?offset=${offset}&limit=${limit}&seller_skus=${encodeSellerSkus}&app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            json: true
        };
        //res.send(options)
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(500).send(error))
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}

module.exports.updateProduct = async (req, res) =>{ 
    //lazada-sdk-client ko encodeURI payload nên ko xài đc
    const apiPath=  '/product/update'
    const accessToken =  req.accessToken 
    const timestamp = Date.now()
    const lazadaproduct = req.body // full product in db
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }

    try {
        // forrmat Product
        if(lazadaproduct.variants){
            lazadaproduct.variants.forEach(variant => {
                variant.SellerSku = variant.sku // đổi tên
        
                delete variant["_id"]
                delete variant["sku"]
                delete variant["ShopSku"]
                delete variant["productId"]
                delete variant["variant_attributes"]
                delete variant["__v"]
                delete variant["special_price"]
            });
        }

        let updateFormatProduct = {
            Request:{
                Product:{
                    ItemId: lazadaproduct.id,
                    //Attributes: lazadaproduct.attributes,
                    Skus:{
                        Sku: lazadaproduct.variants
                    }
                }
            }
        }

        const payload = '<?xml version="1.0" encoding="UTF-8"?>' + convert.js2xml(updateFormatProduct,payloadOptions)

        const sign = signRequest(appSecret, apiPath, {...commonRequestParams, payload})
        const encodePayload = encodeURIComponent(payload)
        let options = {
            method: 'POST',
            url: `${apiUrl}${apiPath}?payload=${encodePayload}&app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            json: true
        };
        //res.send(options.url)
        //console.log(util.inspect(updateFormatProduct, {showHidden: false, depth: null}))
        await rp(options)
        .then(response=> {
            return res.send(response)
        })
        .catch(error => res.status(414).send(error)) //414 url too long
        
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.updatePriceQuantity = async (req, res) =>{
    //lazada-sdk-client ko encodeURI payload nên ko xài đc
    const apiPath=  '/product/update'
    const appSecret = process.env.LAZADA_APP_SECRET
    const appKey = process.env.LAZADA_APP_KEY
    const accessToken =  req.accessToken 
    const timestamp = Date.now()
    const { lazadaProduct, variantId } = req.body // full product in db
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }
    try {
         // forrmat Product
        if(lazadaProduct.variants){
            lazadaProduct.variants.forEach(variant => {
                variant.SellerSku = variant.sku // đổi tên
        
                delete variant["_id"]
                delete variant["sku"]
                delete variant["ShopSku"]
                delete variant["productId"]
                delete variant["variant_attributes"]
                delete variant["__v"]
                delete variant["special_price"]
            });
        }

        delete lazadaProduct.attributes.description

        let updateFormatProduct = {
            Request:{
                Product:{
                    ItemId: lazadaProduct.id,
                    // "Attributes": lazadaProduct.attributes,
                    Skus:{
                        Sku: [lazadaProduct.variants.find(matchedVariant => matchedVariant.SkuId === variantId)]
                    }
                }
            }
        }

        const payload = '<?xml version="1.0" encoding="UTF-8"?>'+ convert.js2xml(updateFormatProduct, payloadOptions)
        const sign = signRequest(appSecret, apiPath, {...commonRequestParams, payload})
        const encodePayload = encodeURIComponent(payload)
        var options = {
            method: 'POST',
            url: apiUrl+apiPath+'?payload='+encodePayload+'&app_key='+appKey+'&sign_method=sha256&timestamp='+timestamp+'&access_token='+accessToken+'&sign='+sign,
            json: true
        };
        //res.send(options.url)
        //console.log(util.inspect(updateFormatProduct, {showHidden: false, depth: null}))
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        res.status(500).send(Error(e));
    }
}


module.exports.createProduct = async (req, res) =>{
    //lazada-sdk-client ko encodeURI payload nên ko xài đc
    const apiPath=  '/product/create'
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const data = req.body
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token:accessToken
    }
    try {
        const payload = '<?xml version="1.0" encoding="UTF-8" ?>'+ convert.js2xml(data, payloadOptions)
        const sign = signRequest(appSecret, apiPath, {...commonRequestParams, payload})
        const encodePayload = encodeURIComponent(payload)
        var options = {
            method: 'POST',
            url: `${apiUrl}${apiPath}?payload=${encodePayload}&app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            json: true
        };
    
        console.log(options)
        await rp(options)
        .then(response=> res.send(response.data))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        console.log("Error: ", e.message)
        res.status(500).send(Error(e));
    }
    
}

module.exports.deleteProduct = async (req, res) =>{
    //lazada-sdk-client ko encodeURI seller_sku_list nên ko xài đc
    const apiPath=  '/product/remove'
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const seller_sku_list= JSON.stringify(req.body.sellerSkuList)
    //console.log(seller_sku_list)
    
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }
    try {
        const sign = signRequest(appSecret, apiPath, {...commonRequestParams, seller_sku_list})
        const encodeSkuList = encodeURI(seller_sku_list)
        let options = {
            method: 'POST',
            url: `${apiUrl}${apiPath}?seller_sku_list=${encodeSkuList}&app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            json: true
        };
        // console.log(options)
        console.log(options)
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        res.status(500).send(Error(e));
    }
    
}
//2: lazada seller API
module.exports.getSellerInfo = async (req, res) =>{
    const apiPath=  '/seller/get'
    const accessToken =  req.accessToken 
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        const response = await client.execute(request, accessToken);
        const  data  = response.data.data ? response.data.data : []
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//Provide seller metrics data of the specific seller, like positive seller rating, ship on time rate and etc.
module.exports.getSellerMetrics = async (req, res) =>{
    const apiPath=  '/seller/metrics/get'
    const accessToken = req.accessToken
    const request = new LazadaRequest(apiPath, 'GET');
    try {

        const response = await client.execute(request, accessToken);
        const  data  = response.data.data ? response.data.data : []
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

//3: lazada order API
module.exports.getCancelReason = async (req, res) =>{
    const apiPath=  '/order/failure_reason/get'
    const accessToken =  req.accessToken 
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        const response = await client.execute(request, accessToken);
        const  data  = response.data.data ? response.data.data : []
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getDocument = async (req, res) =>{
    // vì lazada bảo mật thông tin khách hàng nên ko get document được
    const apiPath=  '/order/document/get'
    const accessToken =  req.accessToken
    const timestamp = Date.now()
    const doc_type = req.query.doc_type //Document types:  'invoice', 'shippingLabel', or 'carrierManifest'
    const order_item_ids = JSON.stringify([req.query.order_item_ids])
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }
    const sign = signRequest(appSecret, apiPath,{...commonRequestParams, doc_type, order_item_ids})
    const encodeOrderIds = encodeURIComponent(order_item_ids)
    try {
        var options = {
            method: 'GET',
            url: `${apiUrl}${apiPath}?app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&doc_type=${doc_type}&order_item_ids=${encodeOrderIds}&sign=${sign}`,
            json: true
        };
        console.log(options)
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.setStatusToPackedByMarketplace = async (req, res) =>{
    const apiPath=  '/order/pack'
    const accessToken =  req.accessToken
    const timestamp = Date.now()
    const shipping_provider = req.body.shipping_provider //
    const delivery_type = req.body.delivery_type  //dropship //pickup //send_to_warehouse
    const order_item_ids = JSON.stringify(req.body.order_item_ids)
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, shipping_provider,delivery_type,order_item_ids})
    const encodeOrderIds = encodeURIComponent(order_item_ids)
    try {
        var options = {
            method: 'POST',
            url: `${apiUrl}${apiPath}?app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&shipping_provider=${shipping_provider}&delivery_type=${delivery_type}&order_item_ids=${encodeOrderIds}&sign=${sign}`,
            json: true
        };
        console.log(options)
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.setStatusToReadyToShip = async (req, res) =>{
    const apiPath=  '/order/rts'
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const shipment_provider = req.body.shipment_provider //
    const delivery_type = req.body.delivery_type  //dropship //pickup //send_to_warehouse
    const order_item_ids = JSON.stringify(req.body.order_item_ids)
    const tracking_number = req.body.tracking_number
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, shipment_provider,delivery_type,order_item_ids, tracking_number})
    const encodeOrderIds = encodeURIComponent(order_item_ids)
    try {
        var options = {
            method: 'POST',
            url: `${apiUrl}${apiPath}?app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&shipment_provider=${shipment_provider}&delivery_type=${delivery_type}&order_item_ids=${encodeOrderIds}&tracking_number=${tracking_number}&sign=${sign}`,
            json: true
        };
        console.log(options)
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.searchOrder = async (req, res) =>{
    //must have created_before or created_after
    const apiPath=  '/orders/get'
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token: accessToken,
    }

    let query = {
        sort_by: req.query.sort_by || 'updated_at',
        sort_direction: req.query.sort_direction || 'DESC',
        offset: req.query.offset || 0,
        limit: req.query.limit || 100,
        created_after: req.query.created_after || '2021-01-01T00:00:00+07:00',
        updated_after: req.query.updated_after || '2021-01-01T00:00:00+07:00',
        //created_before: req.query.created_before,
        //update_before: req.query.update_before
    }
    if(req.query.status){
        query.status = req.query.status
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, ...query})
    try {
        var options = {
            method: 'GET',
            url: `${apiUrl}${apiPath}?app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            json: true
        };
        for (const [key, value] of Object.entries(query)) {
            options.url += '&'+ key + '=' + encodeURIComponent(value)
        }
        await rp(options)
        .then(response=> res.send(response.data.orders))
        .catch(error => res.status(500).send(error))
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getOrderById = async (req, res) =>{
    const apiPath=  '/order/get'
    const accessToken =  req.accessToken // goi db
    const order_id = req.params.id
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("order_id", order_id);
        const response = await client.execute(request, accessToken);
        const  data  = response.data.data ? response.data.data : []

        res.status(200).send(response.data.data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
module.exports.getOrderItems = async (req, res) =>{
    const apiPath=  '/order/items/get'
    const accessToken =  req.accessToken // goi db
    const order_id = req.params.id
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("order_id", order_id);
        const response = await client.execute(request, accessToken);
        const  listItem  = response.data.data ? response.data.data : []

        //console.log(listItem)
        listItem.map(item => {
            item.quantity = 1
            item.price = item.item_price
        });
        var i,m =0
        for(i =1;i < listItem.length;i++){
            if(listItem[m].sku === listItem[i].sku){
                listItem[m].quantity++
                listItem.splice(i,1)
                i--
            }else{
                m = i
            }
        }
        res.status(200).send(listItem)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//setStatusToCancel
module.exports.cancelOrder = async (req, res) =>{ 
    const apiPath=  '/order/cancel'
    const accessToken =  req.accessToken // goi db
    const timestamp = Date.now()
    const reason_detail = req.body.reason_detail || ""// not required
    const reason_id = req.body.reason_id
    const order_item_id = req.params.id
    const commonRequestParams = {
        app_key: appKey,
        timestamp: timestamp,
        sign_method: signMethod,
        access_token:accessToken
    }
    const sign = signRequest(appSecret, apiPath, {...commonRequestParams, reason_id, order_item_id})
    try {
        var options = {
            method: 'POST',
            url: `${apiUrl}${apiPath}?reason_id=${reason_id}&order_item_id=${order_item_id}&reason_detail=${reason_detail}&app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            json: true
        };
        console.log(options)
        await rp(options)
        .then(response=> res.send(response))
        .catch(error => res.status(414).send(error)) //414 url too long
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

//not use
module.exports.uploadImage = async (req, res) =>{
    //lazada-sdk-client chưa có file upload interface
    const apiPath=  '/image/upload'
    const accessToken =  req.accessToken 
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
            method: 'POST',
            url: `${apiUrl}${apiPath}?app_key=${appKey}&sign_method=${signMethod}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            formData:{
                image: {
                    value: fs.createReadStream(req.file.path),
                    options: {
                        filename: req.file.path,
                        contentType: null
                    }
                }
            },
            json: true
        };
        //console.log(options)
        await rp(options)
        .then(response=> res.status(200).send(response.data))
        .catch(error => res.status(error.statusCode).send(error.error))
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getCategoryTree = async (req, res) =>{
    // no need access_token
    const apiPath=  '/category/tree/get'
    const accessToken =  req.accessToken
    const client = new LazadaClient(apiUrl, appKey, appSecret)
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        const response = await client.execute(request, accessToken);
        const { data } = response.data
        
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getBrands = async (req, res) =>{
    // no need access_token
    const apiPath=  '/category/brands/query'
    const accessToken =  req.accessToken
    const startRow = req.query.startRow
    const pageSize = req.query.pageSize
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("startRow", startRow);
        request.addApiParam("pageSize", pageSize);
        const response = await client.execute(request, accessToken);
        const  data  = response.data.data ? response.data.data : []

        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getAttributes = async (req, res) =>{
    // no need access_token
    // use primary_category_id( final category ex: 10100183)
    const apiPath=  '/category/attributes/get'
    const primary_category_id = req.params.categoryId
    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("primary_category_id", primary_category_id);
        const response = await client.execute(request);
        const  data  = response.data.data ? response.data.data : []

        res.status(200).send(data)
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.checkPaidStatus = async (req, res) =>{
    
    const apiPath=  '/finance/transaction/details/get'
    const accessToken = req.accessToken
    const trade_order_id = req.params.id

    const request = new LazadaRequest(apiPath, 'GET');
    try {
        request.addApiParam("trade_order_id", trade_order_id);
        request.addApiParam("start_time", "2021-01-01")
        request.addApiParam("end_time", "2022-01-05")
        const response = await client.execute(request, accessToken);
        const  data  = response.data.data ? response.data.data : []
        let isPaid = false
        let amount = 0
        let transaction_date = ""
        data.map(item=>{
            if(item.paid_status === 'paid'){
                item.amount = item.amount.replace(",", "")
                amount += parseFloat(item.amount) 
                if(item.transaction_type === "Orders-Sales"){
                    isPaid = true
                    transaction_date = item.transaction_date
                }
            }
        })
        res.status(200).send({
            isPaid,
            amount,
            transaction_date,
            data: data
        })
    } catch (e) {
        res.status(500).send(Error(e));
    }
}