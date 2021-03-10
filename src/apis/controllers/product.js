const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');

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
    const product = await Product.find({id: productId})
    
    res.send(product)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createMMSProduct = async (req, res) => {
 
  const item = req.body;
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)
  //const update_at = new Date(item.data.updated_date_timestamp*1000)
  //const create_at = new Date(item.data.created_date_timestamp*1000)
  
  // attributes.forEach(element => {
  //   var arr = element.attribute_values.filter((child) => {
  //     return child.is_selected === true
  //   });
  //   element.attribute_values = arr
  // }); 
  // const variants = item.data.variants
  

  // variants.forEach( e => {
  //   e.variant_attributes.forEach(e1 => {
  //     const attribute = attributes.find((attribute)=>{
  //       return attribute.attribute_id === e1.attribute_id
  //   });
  //     e1.attribute_name = attribute.attribute_name
  //   })
  // });

    
  const product = new Product({
    id: item.id,
    name: item.name,
    description: item.description,
    avatar: item.avatar,
    variants: item.variants
  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateProduct = async (req, res) => {
  
  const properties = Object.keys(req.body);

  
  try {
    const product = await Product.findOne({id: req.body.id});
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
    const product = await Product.findOneAndDelete(req.params.id);

    if (!product) {
      return res.status(404).send();
    }

    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
