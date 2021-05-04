const Product = require("../models/product");
const Error = require("../utils/error");
const Variant = require('../models/variant')
const rp = require('request-promise')
const fs = require('fs')

module.exports.createMultiPlatform = async (req, res) => {
  const products = req.body

  try {
    for(let item of products) {
      if(item.post === true) {
        console.log("Begin create to: ", item.store_name)
        if(item.platform_name === 'lazada') {
            const lazRes = await rp({
              method: 'POST',
              url: `{process.env.API_URL}/api/lazada/products`,
              body: {
                Request: item.Request
              },
              json: true,
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
                'Platform-Token': item.access_token
            }
           })
          
          console.log(lazRes)

          await rp({
            method: 'POST',
            url: `{process.env.API_URL}/lazada/products/fetch`,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': item.access_token
            },
            body: {
              store_id: item.store_id,
              lastSync: item.lastSync
            },
            json: true
          })   

        } else if(item.platform_name === 'sendo') {
          await rp({
            method: 'POST',
            url: `{process.env.API_URL}/api/sendo/products`,
            body: item,
            json: true,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': item.access_token
            }
          })

          await rp({
            method: 'POST',
            url: `{process.env.API_URL}/sendo/products/fetch`,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': item.access_token
            },
            body: {
              store_id: item.store_id,
              lastSync: item.lastSync
            },
            json: true
          })          
        } else if(item.platform_name === 'system') {
          await rp({
            method: 'POST',
            url: `{process.env.API_URL}/products`,
            body: {
              ...item,
              sellable: true,
            },
            json: true,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
            }
          })
        }
      }
    }

    return res.status(200).send("Ok")
  } catch(e) {
    console.log("Error", e.message)
    res.status(500).send(Error({ message: 'Có gì đó không ổn !'}))
  }
};

module.exports.getAllProduct = async (req, res) => {
  console.log(req.user.currentStorage)
  try {
    const products = await Product.find({ storageId: req.user.currentStorage.storageId }).populate('variants').lean()

    res.send(products)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getMMSProductById = async function (req, res) {
  try {
    const productId = req.params.id;
    const product = await Product.find({ _id: productId }).populate('variants').lean()

    res.send(product)
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
          url: `{process.env.API_URL}/purchase-orders/init`,
          json: true,
          body: {
            code: `KHỞI_TẠO_${req.body.sku.toUpperCase()}_${new Date().toLocaleDateString()}`,
            note: 'Khởi tạo ban đầu',
            supplierAddress: 'Chi nhánh mặc định',
            supplierName: req.user.displayName,
            supplierId: req.user._id,
            supplierPhone: 'Mặc định',
            supplierEmail: req.user.email,
            totalPrice: 0,
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

    res.status(200).send(result);
  } catch (e) {
    console.log(e.message)
    res.status(500).send(Error(e));
  }
};

module.exports.updateProduct = async (req, res) => {
  
  const properties = Object.keys(req.body);
  
  try {
    const product = await Product.findOne({ id: req.body.id });
    if (!product) {
      res.status(404).send(product);
    }

    properties.forEach((prop) => (product[prop] = req.body[prop]));

    product.save();

    res.send(product);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id });

    if (!product) {
      return res.status(404).send();
    }

    await Variant.deleteMany({ productId: product._id })

    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.checkSku = async (req,res) => {
  const { sku } = req.query
  const matchedProductSku = await Product.findOne({ sku })
  res.status(200).send({
    isSkuExists: !!matchedProductSku
  })
}
