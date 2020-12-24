const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const util = require('util');
const { time } = require("console");

module.exports.getAllProduct = async (req, res) => {
  try {
    
    const products = await Product.find({})
    
    res.send(products)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getProductById = async function (req, res) {
  try {
    const productId = req.params.id;
    const product = await Product.find({id: productId})
    
    res.send(product)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createProduct = async (req, res) => {
  const item = req.body;
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)
  // const array = item.attributes

  // array.forEach(element => {
  //   var arr = element.attribute_values.filter((child) => {
  //     return child.is_selected === true
  //   });
  //   element.attribute_values = arr
  // });
  console.log("received data")
  const product = new Product({
    store_ids: [req.shop_key],
    store_name: item.store_name,
    sendo_product_id: item.id,
    lazada_product_id: item.item_id,
    name: item.name,
    name: item.attributes.name,
    sku: item.store_sku,
    sku: item.sku,
    sku: item.skus[0].SellerSku,
    price: item.price,
    price:item.skus[0].price,
    weight: item.weight,
    stock_availability: item.stock_availability,
    stock_availability: item.stock,
    
    stock_quantity: item.stock_quantity,
    stock_quantity: item.skus[0].quantity,

    sendo_cat4_id: item.cat4_id,
    lazada_primary_category: item.primary_category,
    sendo_product_status: item.product_status,
    lazada_product_status: item.skus[0].Status,
    
    updated_date_timestamp: item.updated_date_timestamp,
    created_date_timestamp: item.created_date_timestamp,
    
    sendo_product_link: item.product_link,
    
    product_image: item.product_image,
    product_image: item.skus[0].Images[0],
    
    sendo_updated_user: item.updated_user,
   
    unit_id: item.unit_id,
    avatar: item.picture,
   
    extend_shipping_package: item.extend_shipping_package,
    variants: item.variants,
   
    voucher: item.voucher
   

  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateProduct = async (req, res) => {
  console.log("Received ping update: ")
  //console.log(req.body)
  // const properties = Object.keys(req.body);


  // try {
  //   const product = await Product.findById(req.body.data.id);

  //   if (!product) {
  //     res.status(404).send(product);
  //   }

  //   properties.forEach((prop) => (product[prop] = req.body[prop]));
  //   product.save();

  //   res.send(product);
  // } catch (e) {
  //   res.status(404).send(Error(e));
  // }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete(req.params.id);

    if (!product) {
      return res.status(404).send();
    }

    res.send(product).send();
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
