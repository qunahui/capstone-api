const auth = require("../../middlewares/auth");
const LazadaProduct = require("../models/lazadaProduct");
const Error = require("../utils/error");
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');


module.exports.getAllProducts = async (req, res) => {
  try {
      const { store_id } = req.query;
      const lazadaProducts = await LazadaProduct.find({ store_id })
  
      res.status(200).send(lazadaProducts)
    } catch(e) {
      res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.createLazadaProduct = async (item, additionalData) => {
  try {
    const stringAttributes = await rp("http://localhost:5000/api/lazada/attribute/"+ item.primary_category)
    const attributes = JSON.parse(stringAttributes)
    const variants = item.skus
    const attribute_sale_props = attributes.filter((attribute)=>{
      return attribute.is_sale_prop === 1
    })
    variants.forEach(variant => {
      const variant_attributes = []
      attribute_sale_props.forEach(prop => {
        const attribute_name = prop.name
        const option_value = variant[`${attribute_name}`]
        variant_attributes.push({
          "attribute_name": attribute_name,
          "option_value": attribute_value
        })
        delete variant[`${attribute_name}`]
      });
      variant.variant_attribute = variant_attributes

    });
    let query = { store_id: additionalData.store_id, id: item.item_id },
        update = {
          store_id: additionalData.store_id,
          variants: variants.map(variant => ({
            ...variant,
            linkedProduct: {
              id: '---',
              name: '---',
              sku: '---',
              status: 'not connected yet',
            }
          })),
          id: item.item_id,
          primary_category: item.primary_category,
          attributes: item.attributes
        },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    await LazadaProduct.findOneAndUpdate(query, update, options, function(error, result) {
      if (!error) {
        if (!result) {
          result = new LazadaProduct(update);
        }
        result.save();
      } 
    });
  } catch(e) {
    console.log("Something went wrong", e)
  }
};