const auth = require("../../middlewares/auth");
const sendoProduct = require("../models/sendoProduct");
const Error = require("../utils/error");
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');

const product_status ={
  "0": "Nháp",
  "1": "Chờ duyệt",
  "2": "Đã duyệt",
  "3": "Từ Chối",
  "4": "Hủy"
}
const product_type ={
  "1": "Sản phẩm vật lý",
  "2": "Voucher/vé giấy",
  "3": "E-voucher/Vé điện tử"
}
const unit ={
  "1": "Cái",
  "2": "Bộ",
  "3": "Chiếc",
  "4": "Đôi",
  "5": "Hộp",
  "6": "Cuốn",
  "7": "Chai",
  "8": "Thùng"
}

module.exports.createSendoProductByPing = async (req, res) => {
console.log("received data")
    const item = req.body;
    //util.inspect(item, false, null, true /* enable colors */)
    //console.log(item)
    const update_at = new Date(item.data.updated_date_timestamp*1000)
    const create_at = new Date(item.data.created_date_timestamp*1000)
    const attributes = item.data.attributes
    const variants = item.data.variants

    attributes.forEach(element => {
        var arr = element.attribute_values.filter((child) => {
            return child.is_selected === true
        });
        element.attribute_values = arr
    }); 
    variants.forEach( e => {
      e.attributes.forEach(e1 => {
        const attribute = attributes.find((attribute)=>{
          return attribute.id === e1.attribute_id
        });
        const attribute_value = attribute.attribute_values.find((value)=>{
          return value.id === e1.option_id
        })
        e1.attribute_name = attribute.name
        e1.option_value = attribute_value.value
      })
    });

  const product = new sendoProduct({
    store_ids: item.store_id,
    product_id: item.data.id,
    product_name: item.data.name,
    store_sku: item.data.store_sku,
    product_weight: item.data.weight,
    stock_quantity: item.data.stock_quantity, // total variants quantity
    product_status: item.data.product_status,    
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    product_link: item.data.product_link,       
    unit: item.data.unit_id,
    avatar: item.data.product_image,
    variants: variants,
    //attributes: attributes,
    voucher: item.data.voucher
  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createSendoProductBySync = async (item) => {
    //util.inspect(item, false, null, true /* enable colors */)
    //console.log(item)
    const update_at = new Date(item.updated_date_timestamp*1000)
    const create_at = new Date(item.created_date_timestamp*1000)
    const attributes = item.attributes
    const variants = item.variants

    attributes.forEach(element => {
        var arr = element.attribute_values.filter((child) => {
            return child.is_selected === true
        });
        element.attribute_values = arr
    }); 
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
  



  const product = new sendoProduct({
    //store_ids: item.store_id,
    product_id: item.id,
    product_name: item.name,
    store_sku: item.sku,
    product_weight: item.weight,
    stock_quantity: item.stock_quantity, // total variants quantity
    product_status: item.status,    
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    product_link: item.product_link,       
    unit: item.unit_id,
    avatar: item.avatar.picture_url,
    variants: variants,
    //attributes: attributes,
    voucher: item.voucher
  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};