const Product = require("../models/product");
const Error = require("../utils/error");
const Variant = require('../models/variant')
const {createLazadaProduct} = require('../controllers/lazadaProduct')
const {createSendoProduct} = require('../controllers/sendoProduct')
const rp = require('request-promise')
const fs = require('fs')
const mongoose = require("mongoose")

module.exports.createMultiPlatform = async (req, res) => {
  const products = req.body
  try {
    products.map(async (item)=>{
      if(item.post === true) {
        console.log("Begin create to: ", item.store_name)
        if(item.platform_name === 'lazada') {
          const options = {
            method: 'POST',
            url: `${process.env.API_URL}/api/lazada/products`,
            body: {
              Request: item.Request
            },
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': item.access_token
            },
            json: true
          }
          await rp(options)
          .then(async(response) =>{
            const options = {
              method: 'GET',
              url: `${process.env.API_URL}/api/lazada/products/${response.item_id}`,
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
                'Platform-Token': item.access_token
              },
              json: true
            }
            await rp(options).then((response)=>{
              createLazadaProduct(response, item.store_id )
            }).catch((error)=>{
              return res.send(error.error)
            })
          })
          .catch((error)=>{
            return res.status(500).send(Error(error))
          })
        } else if(item.platform_name === 'sendo') {
          console.log("Sendo item: ", item)
          const options = {
            method: 'POST',
            url: `${process.env.API_URL}/api/sendo/products`,
            body: item,
            json: true,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': item.access_token
            }
          }
          await rp(options).then(async(response)=>{
            const options ={
              method: 'GET',
              url: `${process.env.API_URL}/api/sendo/products/${response.result}`,
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
                'Platform-Token': item.access_token
              },
              json: true
            }
            await rp(options).then((response)=>{
              createSendoProduct(response, item.store_id )
            }).catch((error)=>{
              return res.send(error.error)
            })
          })
        } else if(item.platform_name === 'system') {
            const options = {
              method: 'POST',
              url: `${process.env.API_URL}/products`,
              body: {
                ...item,
                sellable: true,
                isConfigInventory: true
              },
              json: true,
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
              }
            }

            await rp(options).then(()=>{
            }).catch((error)=>{
              return res.send(error.error)
            })
        }
      }
    })
    return res.sendStatus(200)
  } catch(e) {
    console.log("Lỗi: ", e.message)
    res.status(500).send(Error({ message: 'Có gì đó không ổn !'}))
  }
};

module.exports.getAllProduct = async (req, res) => {
  const { name, type } = req.query

  const filter = { storageId: req.user.currentStorage.storageId }
  if(type !== 'all') {
    filter.sellable = type === 'active'
  }

  try {
    const products = await Product.fuzzySearch({ query: name, minSize: 3 }).find(filter).populate('variants').lean()
    res.status(200).send(products)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getMMSProductById = async function (req, res) {
  try {
    const productId = req.params._id;
    const product = await Product.findOne({ _id: productId }).populate('variants').lean()
    if (!product) {
      return res.sendStatus(404);
    }
    res.status(200).send(product)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createMMSProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      storageId: req.user.currentStorage.storageId
    });
    let configVariant = []
    await product.save();
    if(req.body.isConfigInventory === true) {
      let totalQuantity = 0
      await Promise.all(req.body.variants.map(async (variant) => {
        totalQuantity += variant.inventories.onHand
        const mongoVariant = new Variant({ 
            ...variant,
            productId: product._id 
        })
        await mongoVariant.save()
        return mongoVariant
      }))
      configVariant = await Variant.find({ productId: product._id }).lean()
      try {
        await rp({
          method: 'POST',
          url: `${process.env.API_URL}/purchase-orders/init`,
          json: true,
          body: {
            code: `NHAP_HANG_${req.body.sku.toUpperCase()}_${new Date().toLocaleDateString()}`,
            note: 'Khởi tạo ban đầu',
            supplierAddress: 'Chi nhánh mặc định',
            supplierName: req.user.displayName,
            supplierId: req.user._id,
            supplierPhone: 'Mặc định',
            supplierEmail: req.user.email,
            subTotal: 0,
            totalQuantity,
            userId: req.user._id,
            lineItems: configVariant.map((variant, index) => ({
              ...variant,
              inventories: {
                onHand: req.body.variants[index].inventories.onHand, 
                initPrice: variant.inventories.initPrice
              },
              variantId: variant._id,
              price: variant.inventories.initPrice,
              quantity: req.body.variants[index].inventories.onHand,
            })),
            init: true,
            orderStatus: 'Đã hoàn thành',
            instockStatus: true,
            paymentStatus: 'Đã thanh toán',
          },
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken
          }
        })
      } catch (e) {
        console.log("Create init purchase order failed: ", e.message)
        return res.status(500).send(Error({ message: 'Có gì đó sai sai! '}))
      }
    }
    const result = await Product.findOne({ _id: product._id }).lean()
    result.variants = configVariant
    if(req.body.autoLink) {
      await Promise.all(configVariant.map(async (item, index) => {
        await rp({
          method: 'POST',
          url: `${process.env.API_URL}/variants/link`, 
          body: {
            variant: item,
            platformVariant: req.body.platformVariants[index]
          },
          json: true,
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken
          }
        })
      }))
    }
    res.status(200).send(result);
  } catch (e) {
    console.log(e.message)
    res.status(500).send(Error(e));
  }
};

module.exports.updateProduct = async (req, res) => {
  const updateField = req.body;
  try {
    const product = await Product.findOneAndUpdate({_id: req.params._id},updateField,{returnOriginal: false})
    if (!product) {
      res.sendStatus(404);
    }
    res.status(200).send(product);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params._id) });
    if (!product) {
      return res.sendStatus(404);
    }
    const variants = await Variant.find({ productId: product._id })
    variants.map(async(variant)=>{
      // unlink platformVariant
      variant.linkedIds.map(async(item)=>{
        if(item.platform === 'sendo'){
          await SendoVariant.findOneAndUpdate({
            _id: item.id,
          }, {
            linkedId: null
          })

          await SendoProduct.findOneAndUpdate({
            _id: item.id,
          }, {
            linkedId: null
          })
        } else if (item.platform === 'lazada'){
          await LazadaVariant.findOneAndUpdate({
            _id: item.id,
          }, {
            linkedId: null
          })

          await LazadaProduct.findOneAndUpdate({
            _id: item.id,
          }, {
            linkedId: null
          })
        }
      })

    })
    await Variant.deleteMany({ productId: product._id })
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.checkSku = async (req,res) => {
  const { sku } = req.query
  try {
    const matchedProductSku = await Product.findOne({ sku, storageId: req.user.currentStorage.storageId })
    res.status(200).send({
    isSkuExists: !!matchedProductSku
    })
  } catch (e) {
    res.status(500).send(Error(e));
  }
}
