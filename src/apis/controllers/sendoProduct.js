const auth = require("../../middlewares/auth");
const SendoProduct = require("../models/sendoProduct");
const Error = require("../utils/error");
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');
const sendoProduct = require("../models/sendoProduct");

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

  const product = new SendoProduct({
    store_ids: item.store_id,
    id: item.data.id,
    name: item.data.name,
    store_sku: item.data.store_sku,
    weight: item.data.weight,
    stock_quantity: item.data.stock_quantity, // total variants quantity
    status: item.data.product_status,    
    updated_date_timestamp: update_at,
    created_date_timestamp: create_at,
    link: item.data.product_link,       
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

module.exports.createSendoProduct = async (item, { store_id }) => {
    try {
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

      let query = { store_id: store_id, id: item.id },
          update = {
            store_id: store_id,
            id: item.id,
            name: item.name,
            store_sku: item.sku,
            weight: item.weight,
            stock_quantity: item.stock_quantity, // total variants quantity
            status: item.status,    
            updated_date_timestamp: update_at,
            created_date_timestamp: create_at,
            link: item.link,       
            unit: item.unit_id,
            avatar: item.avatar.picture_url,
            variants: variants,
            //attributes: attributes,
            voucher: item.voucher
          },
          options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
      console.log("Begin insert: ", update.id)
      await SendoProduct.findOneAndUpdate(query, update, options, function(error, result) {
        if (!error) {
          if (!result) {
            result = new SendoProduct(update);
          }
          result.save().then((res) => {
            console.log("save: ", res.id)
          });
        }
      });
    } catch(e) { 
      console.log("Error: ", e)
    }
};
module.exports.getAllProducts = async (req, res) => {
  try {
    const { storeIds } = req.query;
    console.log(storeIds)
    let sendoProducts = []
    await Promise.all([...storeIds.map(async storeId => {
      
      const products = await SendoProduct.find({store_id: storeId })
      
      sendoProducts = [...sendoProducts, ...products]
    })])

    res.status(200).send(sendoProducts)
  } catch(e) {
    res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.fetchProducts = async (req, res) => {
  
  try {
    const options = {
        'method': 'POST',
        'url': 'https://open.sendo.vn/api/partner/product/search',
        'headers': {
          'Authorization': 'bearer ' + req.accessToken,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({"page_size":10,"product_name":"","date_from":"2020-05-01","date_to":"9999-10-28","token":""})
    };
    const response = await rp(options)
    const products = JSON.parse(response).result.data
    await Promise.all(products.map(async product => {
      const fullProduct = await rp({
        method: 'GET',
        url: 'http://localhost:5000/api/sendo/products/' + product.id + '?access_token=' + req.accessToken
      })
      const actuallyFullProduct = JSON.parse(fullProduct)
      await createSendoProduct(actuallyFullProduct, { store_id: req.body.store_id })
    }))

    console.log("Run this")

    const sendoProducts = await SendoProduct.find({ storageId: req.body.storageId})

    res.status(200).send(sendoProducts)
  } catch(e) {
    console.log(e)
  }
}