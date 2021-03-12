const auth = require("../../middlewares/auth");
const LazadaProduct = require("../models/lazadaProduct");
const Error = require("../utils/error");
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');
const { signRequest } = require('../utils/laz-sign-request')

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
      variant.variant_attribute = variant_attributes

    });
    let query = { store_id: additionalData.store_id, id: item.item_id },
        update = {
          store_id: additionalData.store_id,
          variants: variants.map(variant => ({
            ...variant,
            linkedProduct: {
              id: '---',
              name: '---',
              sku: '---',
              status: 'not connected yet',
            }
          })),
          id: item.item_id,
          primary_category: item.primary_category,
          attributes: item.attributes
        },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    await LazadaProduct.findOneAndUpdate(query, update, options, function(error, result) {
      if (!error) {
        if (!result) {
          result = new LazadaProduct(update);
        }
        result.save();
      } 
    });
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
        const products = await LazadaProduct.find({ store_id: storeId })
        lazadaProducts = [...lazadaProducts, ...products]
      }))
  
      console.log("lazada all products: ", lazadaProducts)

      res.status(200).send(lazadaProducts)
    } catch(e) {
      res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.getAllProducts = async (req, res) => {
  try {
      const { storeIds } = req.query;
      let lazadaProducts = [];
      await Promise.all([...storeIds].map(async storeId => {
        const products = await LazadaProduct.find({store_id: storeId})
        lazadaProducts = [...lazadaProducts, ... products]
      }))
      
  
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
  const accessToken =  req.accessToken
  const timestamp = Date.now()
  const commonRequestParams = {
      "app_key": appKey,
      "timestamp": timestamp,
      "sign_method": "sha256",
      "access_token":accessToken,
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
      console.log("options: ", options)
      const { products } = data
      await Promise.all(products.map(async product => await createLazadaProduct(product, { store_id: req.body.store_id })))
  } catch (e) {
      res.status(500).send(Error(e));
  }
  const lazadaProducts = await LazadaProduct.find({ storageId: req.body.storageId, store_id: req.body.store_id })
  
  res.status(200).send(lazadaProducts)
}