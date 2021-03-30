const LazadaProduct = require("../models/lazadaProduct");
const { LazadaRequest, LazadaClient } = require('lazada-sdk-client');
const querystring = require('querystring')
const Error = require("../utils/error");
const rp = require('request-promise');
const { signRequest } = require('../utils/laz-sign-request');
const timeDiff = require("../utils/timeDiff");
const LazadaVariant = require("../models/lazadaVariant");
const Storage = require("../models/storage");


const createLazadaProduct = async (item, additionalData) => {
  try {
    const stringAttributes = await rp("http://localhost:5000/api/lazada/attribute/"+ item.primary_category)
    const attributes = JSON.parse(stringAttributes)
    const variants = item.skus
    const attribute_sale_props = attributes.filter((attribute)=>{
      return attribute.is_sale_prop === 1
    })
    variants.forEach(variant => {
      const variant_attributes = []
      attribute_sale_props.forEach(prop => {
        const attribute_name = prop.name
        const option_value = variant[`${attribute_name}`]
        variant_attributes.push({
          "attribute_name": attribute_name,
          "option_value": option_value
        })
        delete variant[`${attribute_name}`]
      });
      variant.variant_attributes = variant_attributes

    });
    let query = { store_id: additionalData.store_id, id: item.item_id },
        update = {
          avatar: variants.length > 0 && variants[0].Images[0],
          store_id: additionalData.store_id,
          variants: variants,
          id: item.item_id,
          primary_category: item.primary_category,
          attributes: item.attributes,
          updated_date_timestamp: new Date(parseInt(item.updated_time)),
          created_date_timestamp: new Date(parseInt(item.created_time))
        },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    const lazadaProduct = await LazadaProduct.findOneAndUpdate(query, update, options)

    variants.forEach(async (variant)=>{
      await LazadaVariant.findOneAndUpdate({sku: variant.SellerSku, productId: lazadaProduct._id}, {
        ...variant,
        sku: variant.SellerSku,
        avatar: variant.Images,
        productId: lazadaProduct._id
      }, options);
    })

  } catch(e) {
    console.log(e.message)
  }
};

module.exports.createLazadaProduct = createLazadaProduct

module.exports.getAllProducts = async (req, res) => {
  try {
      const { storeIds } = req.query;
      let lazadaProducts = [];
      await Promise.all([...storeIds].map(async storeId => {
        const products = await LazadaProduct.find({store_id: storeId}).populate({
          path: 'variants',
          populate: {
            path: 'linkedDetails'
          }
        }).lean()
        lazadaProducts = [...lazadaProducts, ... products]
      }))
      
  
      return res.status(200).send(lazadaProducts)
    } catch(e) {
      console.log(e)
      return res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.fetchProductsWithoutAuth = async (req, res) =>{
  const { store_id } = req.body
  const apiUrl = 'https://api.lazada.vn/rest' 
  const apiPath=  '/products/get'
  const appSecret = process.env.LAZADA_APP_SECRET 
  const appKey = process.env.LAZADA_APP_KEY 
  const accessToken =  req.accessToken
  const timestamp = Date.now()
  const commonRequestParams = {
      "app_key": appKey,
      "timestamp": timestamp,
      "sign_method": "sha256",
      "access_token": accessToken,
  }
  const filter = req.body.filter || "live"
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
      const { products } = data
      res.status(200).send(products)
      await Promise.all(products.map(async product => {
        const lazadaProduct = await LazadaProduct.findOne({ id: product.item_id, store_id })
        if(lazadaProduct) {
          const secondDiff = timeDiff(new Date(parseInt(product.updated_time)), new Date(lazadaProduct.updated_date_timestamp)).secondsDifference
          if(secondDiff === 0) {
            return product;
          } else if (secondDiff < 0) {
            //xu ly push len api lazada
            //return;
          }
        }

        await createLazadaProduct(product, { store_id })
      }))
  } catch (e) {
      res.status(500).send(Error(e));
  }
  const lazadaProducts = await LazadaProduct.find({ storageId: req.body.storageId, store_id: req.body.store_id })
  
  res.status(200).send(lazadaProducts)
}

module.exports.fetchDeletedProducts = async (req, res) =>{
  try {
    const { store_id, lastSync } = req.body
    const apiUrl = 'https://api.lazada.vn/rest' 
    const apiPath=  '/products/get'
    const appSecret = process.env.LAZADA_APP_SECRET 
    const appKey = process.env.LAZADA_APP_KEY 
    const accessToken =  req.accessToken
    const lazFormatDate = lastSync.split('.')[0].concat('+0700')
    
    const client = new LazadaClient(apiUrl, appKey, appSecret)
    const request = new LazadaRequest(apiPath, 'GET');
    request.addApiParam("filter", "deleted"); // http method default is post
    request.addApiParam("update_after", lazFormatDate);
    const response = await client.execute(request, accessToken);
    const { data } = response.data
    const { products } = data
    res.status(200).send(products)
  } catch(e) {
    res.status(400).send(Error(e))
  }
}

module.exports.fetchProducts = async (req, res) =>{
  const { store_id } = req.body
  const apiUrl = 'https://api.lazada.vn/rest' 
  const apiPath=  '/products/get'
  const appSecret = process.env.LAZADA_APP_SECRET 
  const appKey = process.env.LAZADA_APP_KEY 
  const accessToken =  req.accessToken
  const timestamp = Date.now()
  const commonRequestParams = {
      "app_key": appKey,
      "timestamp": timestamp,
      "sign_method": "sha256",
      "access_token": accessToken,
  }
  const filter = req.body.filter || "live"
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
      const products = data.products || []
      await Promise.all(products.map(async product => {
        const lazadaProduct = await LazadaProduct.findOne({ id: product.item_id, store_id })
        if(lazadaProduct) {
          const secondDiff = timeDiff(new Date(parseInt(product.updated_time)), new Date(lazadaProduct.updated_date_timestamp)).secondsDifference
          if(secondDiff === 0) {
            return product;
          } else if (secondDiff < 0) {
            //xu ly push len api lazada
            //return;
          }
        }

        await createLazadaProduct(product, { store_id })
      }))
  } catch (e) {
    console.log(e)
      res.status(500).send(Error(e));
  }
  const lazadaProducts = await LazadaProduct.find({ storageId: req.body.storageId, store_id: req.body.store_id })
  
  res.status(200).send(lazadaProducts)
}

module.exports.syncProducts = async (req, res) => {
  const { payload } = req.body
  const { storageId } = req.user.currentStorage
  //check token
  console.clear()
  let newCredential = null;
  try { 
    newCredential = await rp({
      method: 'POST',
      url: 'http://localhost:5000/api/lazada/login',
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': payload.access_token
      },
      body: {
        credential: payload
      },
      json: true
    })

  } catch(e) {
    console.log(e.message)
    return res.status(400).send(Error({ message: 'Lấy lazada token thất bại !'}))
  }

  if(newCredential.isRefreshExpired) {
    return res.status(400).send(Error({
      message: "Refresh token đã hết hạn !",
    }))
  }

  // fetch deleted products
  if(newCredential.lastSync) {
    console.log("check deleted lazada products")
    const options = {
      method: 'POST',
      url: 'http://localhost:5000/lazada/products/fetch-deleted',
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': newCredential.access_token
      },
      body: {
        store_id: payload.store_id,
        lastSync: newCredential.lastSync
      },
      json: true
    }

    const deletedProducts = await rp(options)
    console.log(deletedProducts)
    await Promise.all(deletedProducts.map(async product => {
      const lazId = await LazadaProduct.findOne({ id: product.item_id})
      if(lazId) {
        await LazadaVariant.deleteMany({ productId: lazId._id })
      }
    }))
  }

  //fetch live products
  try {
    const options = {
      method: 'POST',
      url: 'http://localhost:5000/lazada/products/fetch',
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': newCredential.access_token
      },
      body: {
        store_id: payload.store_id
      },
      json: true
    }

    await rp(options)

    await Storage.updateOne({ 
      _id: storageId,
      lazadaCredentials: {
        $elemMatch: {
          _id: newCredential._id,
          store_id: newCredential.store_id
        }
      }
    } , {
      $set: {
        "lazadaCredentials.$.lastSync": new Date(),
      }
    })

    return res.status(200).send({
      message: "Đồng bộ thành công !",
    })
  } catch(e) {
    return res.status(e.response.statusCode).send(Error({ message: e.response.statusMessage}))
  }

}

module.exports.createProduct = async (req, res) => {
  try {
    const item = req.body // change this
    const stringAttributes = await rp("http://localhost:5000/api/lazada/attribute/"+ item.primary_category)
    const attributes = JSON.parse(stringAttributes)
    const variants = item.skus
    const attribute_sale_props = attributes.filter((attribute)=>{
      return attribute.is_sale_prop === 1
    })
    variants.forEach(variant => {
      const variant_attributes = []
      attribute_sale_props.forEach(prop => {
        const attribute_name = prop.name
        const option_value = variant[`${attribute_name}`]
        variant_attributes.push({
          "attribute_name": attribute_name,
          "option_value": option_value
        })
        delete variant[`${attribute_name}`]
      });
      variant.variant_attributes = variant_attributes

    });
    let query = { store_id: '123', id: item.item_id }, // change this
        update = {
          avatar: variants.length > 0 && variants[0].Images[0],
          store_id: '123',
          id: item.item_id,
          primary_category: item.primary_category,
          attributes: item.attributes,
          updated_date_timestamp: new Date(parseInt(item.updated_time)),
          created_date_timestamp: new Date(parseInt(item.created_time))
        },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    await LazadaProduct.findOneAndUpdate(query, update, options, function(error, result) {
      if (!error) {
        if (!result) {
          result = new LazadaProduct(update);
        }

        result.save().then((res) => {
          console.log("save: ", res._id)

          variants.forEach(async (variant)=>{
            await LazadaVariant.findOneAndUpdate({sku: variant.SellerSku, productId: res._id}, {
              ...variant,
              sku: variant.SellerSku,
              avatar: variant.Images,
              productId: res._id
            }, options, function(error, result) {
              if (!error) {
                if (!result) {
                  result = new LazadaVariant( {
                    ...variant,
                    sku: variant.SellerSku,
                    avatar: variant.Images,
                    productId: res._id
                  });
                }
                result.save().then((res) => {
                  console.log("save: ", res.id)
                });
              }
            });
          }) 
        });
      } 
    });
  } catch(e) {
    console.log(e.message)
  }
}


module.exports.getProductById = async (req, res) => {
  const id = req.params.id
  const lazadaproduct = await LazadaProduct.find({}).populate('lazadaVariants').lean()

  res.send(lazadaproduct)
}