const mongoose = require("mongoose")
const Product = require("../models/product");
const Error = require("../utils/error");
// const sendo = require('./sendo')
const Inventory = require('../models/inventory');
const Variant = require("../models/variant")


module.exports.getAllVariant = async (req, res) => {
  try {
    
    const variants = await Variant.find({})
    
    res.send(variants)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getMMSVariantById = async function (req, res) {
  try {
    const variantId = req.params.id;
    const variant = await Product.find({ _id: variantId })
    res.send(variant)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createMMSVariant = async (req, res) => {
  try {
    const variant = new Variant({...req.body});

    await variant.save();

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

    res.send(variant);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateVariant = async (req, res) => {
  const properties = Object.keys(req.body);

  try {
    const variant = await Variant.findOne({ _id: req.body._id });
    if (!variant) {
      res.status(404).send(variant);
    }

    properties.forEach((prop) => (variant[prop] = req.body[prop]));

    variant.save();

    res.send(variant);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteVariant = async (req, res) => {
  console.log(req.params)
  try {
    const variant = await Variant.findOneAndDelete({ _id: req.params.id });

    if (!variant) {
      return res.status(404).send();
    }

    res.send(variant);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
