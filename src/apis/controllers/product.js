const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
// const sendo = require('./sendo')
const SendoProduct = require('../models/sendoProduct')
const Inventory = require('../models/inventory')

module.exports.linkProduct = async (req, res) => {
  const { payload } = req.body;
  const products = await Product.find({})

  await Promise.all(payload.map(async credential => {
    if(credential.platform_name === 'sendo') {
      //call link sendo route
      const platformProducts = await SendoProduct.find({ store_id: credential.store_id })
      products.map(product => {
        platformProducts.map(platProduct => {
          if(platProduct.store_sku === product.sku) {
            console.log("matched: ", platProduct.name, " === ", product.name)
          }
        })
      })
    } else if(credential.platform_name === 'lazada') {
      //call link lazada route
    }
  }))
  console.log("done")
}

module.exports.getAllProduct = async (req, res) => {
  try {
    
    const products = await Product.find({})
    
    res.send(products)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getMMSProductById = async function (req, res) {
  try {
    const productId = req.params.id;
    const product = await Product.find({ _id: productId })
    res.send(product)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createMMSProduct = async (req, res) => {
  try {
    const product = new Product({...req.body});

    await product.save();

    if(req.body.isConfigInventory === true) {
      await Promise.all(product.variants.map(async (variant) => {
        const inventory = new Inventory({
          variantId: variant._id,
          actionName: 'Khởi tạo biến thể',
          change: {
            amount: variant.inventories.initStock,
            type: 'Tăng'
          },
          instock: variant.inventories.initStock,
          price: variant.inventories.initPrice,
        })
  
        await inventory.save()
      }))
    }

    res.send(product);
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
    const matchedVariantSku = await Product.find({ "variants.sku": sku })
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
