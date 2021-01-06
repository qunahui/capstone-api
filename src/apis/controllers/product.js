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

module.exports.createProductByPing = async (req, res) => {
  const item = req.body;
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)

  const array = item.attributes
  array.forEach(element => {
    var arr = element.attribute_values.filter((child) => {
      return child.is_selected === true
    });
    element.attribute_values = arr
  }); 
  console.log("received data")
  const update_at = new Date(item.data.updated_date_timestamp*1000)
  const create_at = new Date(item.data.created_date_timestamp*1000)
  const product = new Product({
    store_ids: [item.store_id],
    sendo_product_id: item.data.id,
    name: item.data.name,
    sku: item.data.store_sku,
    price: item.data.price,
    weight: item.data.weight,
    stock_quantity: item.data.stock_quantity,
    sendo_product_status: item.data.product_status,    
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    sendo_product_link: item.data.product_link,       
    unit_id: item.data.unit_id,
    avatar: item.data.product_image,
    variants: item.data.variants,
    attributes: array,
    voucher: item.data.voucher
  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
module.exports.createProductBySyncSendo = async (req, res) => {
  const item = req.body;
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)
  const array = item.attributes

  array.forEach(element => {
    var arr = element.attribute_values.filter((child) => {
      return child.is_selected === true
    });
    element.attribute_values = arr
  });
  console.log("received data")
  const update_at = new Date(item.updated_date_timestamp*1000)
  const create_at = new Date(item.created_date_timestamp*1000)
  const product = new Product({
    store_ids: [req.shop_key],
    store_name: item.store_name,
    sendo_product_id: item.id,
    lazada_product_id: "-1",
    name: item.name,
    sendo_sku: item.sku,
    weight: item.weight,
    stock_availability: item.stock_availability,
    stock_quantity: item.stock_quantity,
    sendo_product_status: item.status,
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    
    sendo_product_link: item.product_link,
   
    unit_id: item.unit_id,
    avatar: item.picture,
   
    variants: item.variants,
    attributes: array,
    voucher: item.voucher
   

  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
module.exports.createProductBySyncLazada = async (req, res) => {
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
    sendo_product_id: -1,
    lazada_product_id: item.item_id,
    name: item.attributes.name,
    sku: item.skus[0].SellerSku,
    price:item.skus[0].price,
    weight: item.skus[0].package_weight,
    stock_quantity: item.skus[0].quantity,
    lazada_product_status: item.skus[0].Status,
    product_image: item.skus[0].Images[0],
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
