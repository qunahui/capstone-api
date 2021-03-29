const Product = require("../models/product");
const Error = require("../utils/error");
const Variant = require('../models/variant')
const rp = require('request-promise')

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
        totalQuantity += variant.inventories.initStock
        const mongoVariant = new Variant({ 
          ...variant,
          inventories: {
            initStock: 0,
            initPrice: variant.inventories.initPrice
          },
          productId: product._id 
        })
        await mongoVariant.save()
        // const inventory = new Inventory({
        //   variantId: mongoVariant._id,
        //   actionName: 'Khởi tạo biến thể',
        //   change: {
        //     amount: variant.inventories.initStock,
        //     type: 'Tăng'
        //   },
        //   instock: variant.inventories.initStock,
        //   price: variant.inventories.initPrice,
        // })

        // await inventory.save()

        return mongoVariant
      }))

      configVariant = await Variant.find({ productId: product._id }).lean()

      try {
        await rp({
          method: 'POST',
          url: 'http://localhost:5000/purchase-orders/init',
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
                initStock: req.body.variants[index].inventories.initStock, 
                initPrice: variant.inventories.initPrice
              },
              variantId: variant._id,
              price: variant.inventories.initPrice,
              quantity: req.body.variants[index].inventories.initStock,
            })),
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
  const matchedProductSku = await Product.findOne({ sku })
  res.status(200).send({
    isSkuExists: !!matchedProductSku
  })
}
