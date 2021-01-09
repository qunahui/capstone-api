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
  console.log("received data")
  const item = req.body;
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)
  const update_at = new Date(item.data.updated_date_timestamp*1000)
  const create_at = new Date(item.data.created_date_timestamp*1000)
  const attributes = item.attributes
  attributes.forEach(element => {
    var arr = element.attribute_values.filter((child) => {
      return child.is_selected === true
    });
    element.attribute_values = arr
  }); 
  const variants = item.data.variants
  

  variants.forEach( e => {
    e.variant_attributes.forEach(e1 => {
      const attribute = attributes.find((attribute)=>{
        return attribute.attribute_id === e1.attribute_id
    });
      e1.attribute_name = attribute.attribute_name
    })
  });

    
  const product = new Product({
    store_ids: [item.store_id],
    sendo_product_id: item.data.id,
    name: item.data.name,
    sku: item.data.store_sku,
    price: item.data.price,
    sendo_product_weight: item.data.weight,
    sendo_stock_quantity: item.data.stock_quantity,
    sendo_product_status: item.data.product_status,    
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    sendo_product_link: item.data.product_link,       
    unit_id: item.data.unit_id,
    avatar: item.data.product_image,
    variants: variants,
    attributes: attributes,
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
  console.log("received data")
  const item = req.body;
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)
  const update_at = new Date(item.updated_date_timestamp*1000)
  const create_at = new Date(item.created_date_timestamp*1000)
  const attributes = item.attributes

  attributes.forEach(element => {
    var arr = element.attribute_values.filter((child) => {
      return child.is_selected === true
    });
    element.attribute_values = arr
  });
  const variants = item.variants
  
  variants.forEach( e => {
    e.variant_attributes.forEach(e1 => {
      const attribute = attributes.find((attribute)=>{
        return attribute.attribute_id === e1.attribute_id
      });
      const attribute_value = attribute.attribute_values.find((value)=>{
        return value.id === e1.option_id
      })
      e1.attribute_name = attribute.attribute_name
      e1.option_value = attribute_value.value
    })
  });
  const product = new Product({
    store_ids: [req.shop_key],
    store_name: item.store_name,
    sendo_product_id: item.id,
    lazada_product_id: "-1",
    name: item.name,
    sendo_sku: item.sku,
    sendo_product_weight: item.weight,
    sendo_stock_availability: item.stock_availability,
    sendo_stock_quantity: item.stock_quantity,
    sendo_product_status: item.status,
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    
    sendo_product_link: item.product_link,
   
    unit_id: item.unit_id,
    avatar: item.picture,
   
    variants: variants,
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

  const stringAttributes = await rp("http://localhost:5000/api/lazada/attribute/"+ item.primary_category)
  const attributes = JSON.parse(stringAttributes)
  const variants = item.skus
  const attribute_sale_props = attributes.filter((attribute)=>{
    return attribute.is_sale_prop === 1
})
  variants.forEach(variant => {
    const variant_attribute = []
    attribute_sale_props.forEach(prop => {
      const attribute_name = prop.name
      const attribute_value = variant[`${attribute_name}`]
      variant_attribute.push({
        "attribute_name": attribute_name,
        "attribute_value": attribute_value
      })
      delete variant[`${attribute_name}`]
    });
    variant.variant_attribute = variant_attribute

  });
 
  const product = new Product({
    store_ids: [req.shop_key],
    sendo_product_id: -1,
    lazada_product_id: item.item_id,
    name: item.attributes.name,
    variants: variants
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
