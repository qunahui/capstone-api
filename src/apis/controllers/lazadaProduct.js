const auth = require("../../middlewares/auth");
const lazadaProduct = require("../models/lazadaProduct");
const Error = require("../utils/error");
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');


module.exports.createLazadaProduct = async (req, res) => {
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
   
    const product = new lazadaProduct({
      skus: variants,
      product_id: item.product_id,
      primary_category: item.primary_category,
      attributes: item.attributes
    });
    try {
      await product.save();
      res.send(product);
    } catch (e) {
      res.status(500).send(Error(e));
    }
  };