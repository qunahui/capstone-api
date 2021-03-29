const auth = require("../../middlewares/auth");
const mongoose = require("mongoose")
const Product = require("../models/product");
const Error = require("../utils/error");
// const sendo = require('./sendo')
const Inventory = require('../models/inventory');
const Variant = require('../models/variant')
const SendoProduct = require("../models/sendoProduct");

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
      configVariant = await Promise.all(req.body.variants.map(async (variant) => {
        const mongoVariant = new Variant({ ...variant, productId: product._id })
        await mongoVariant.save()

        const inventory = new Inventory({
          variantId: mongoVariant._id,
          actionName: 'Khởi tạo biến thể',
          change: {
            amount: variant.inventories.initStock,
            type: 'Tăng'
          },
          instock: variant.inventories.initStock,
          price: variant.inventories.initPrice,
        })

        await inventory.save()

        return mongoVariant
      }))
    }

    const result = await Product.findOne({ _id: product._id }).lean()
    result.variants = configVariant

    res.status(200).send(result);
  } catch (e) {
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

    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.checkSku = async (req,res) => {
  const { sku } = req.query
  const matchedProductSku = await Product.find({ sku })
  if(matchedProductSku.length > 0) {
    res.status(200).send({
      isSkuExists: true
    })
  } else if(matchedProductSku.length === 0) {
    const matchedVariantSku = await Variant.find({ sku })
    if(matchedVariantSku.length > 0) { 
      res.status(200).send({
        isSkuExists: true
      })
    } else if(matchedProductSku.length === 0) {
      res.status(200).send({
        isSkuExists: false
      })
    }
  }
}
