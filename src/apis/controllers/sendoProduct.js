const auth = require("../../middlewares/auth");
const SendoProduct = require("../models/sendoProduct");
const Error = require("../utils/error");
const util = require('util')
const rp = require('request-promise');
const Product = require("../models/product");
const timeDiff = require("../utils/timeDiff");

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
const unit = [
  "Cái",
  "Bộ",
  "Chiếc",
  "Đôi",
  "Hộp",
  "Cuốn",
  "Chai",
  "Thùng"
]


const createSendoProduct = async (item, { store_id }) => {
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
        console.log(element.attribute_values)
    }); 
    variants.forEach( e => {
      let avatar = '';
      e.variant_attributes.forEach(e1 => {
        const attribute = attributes.find((attribute)=>{
          return attribute.attribute_id === e1.attribute_id
        });
        const attribute_value = attribute.attribute_values.find((value)=>{
          return value.id === e1.option_id
        })
        e1.attribute_name = attribute.attribute_name
        e1.option_value = attribute_value.value
        e1.attribute_img = attribute_value.attribute_img
        avatar = attribute_value.attribute_img || ''
      })

      e.avatar = avatar
    });

    let query = { store_id: store_id, id: item.id },
        update = {
          // id: item.id,
          // name: item.name,
          // store_sku: item.sku,
          // weight: item.weight,
          // stock_quantity: item.stock_quantity, // total variants quantity
          // status: item.status,    
          // link: item.link,       
          // voucher: item.voucher,
          // variants: variants,
          ...item,
          variants,
          store_id: store_id,
          unit: unit[item.unit_id - 1],
          unitId: item.unit_id,
          avatar: item.avatar.picture_url,
          updated_date_timestamp: update_at,
          created_date_timestamp: create_at,
          //attributes: attributes,
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

module.exports.createSendoProduct = createSendoProduct


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
    stock_availability: item.data.stock_availability, 
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
    return res.send(product);
  } catch (e) {
    return res.status(500).send(Error(e));
  }
};

module.exports.getAllProducts = async (req, res) => {
  try {
    const { storeIds } = req.query;
    await Promise.all([...storeIds].map(async storeId => {
      const products = await SendoProduct.find({ store_id: storeId })
        
    }))
    
    res.status(200).send(products)
  } catch(e) {
    console.log("err: ", e.message)
    return res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.fetchProducts = async (req, res) => {
  const { store_id } = req.body
  const { storageId } = req.user.currentStorage
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
      const sendoProduct = await SendoProduct.findOne({ id: product.id, store_id })
      if(sendoProduct) {
        const secondDiff = timeDiff(new Date(product.updated_at_timestamp*1000), new Date(sendoProduct.updated_date_timestamp)).secondsDifference
        if(secondDiff === 0) {
          return product;
        } else {
          if(secondDiff < 0) {
            // xu ly push len api lai
            // return;
          }
        }
      }

      const fullProduct = await rp({
        method: 'GET',
        url: 'http://localhost:5000/api/sendo/products/' + product.id + '?access_token=' + req.accessToken,
        headers: {
          'Authorization': 'Bearer ' + req.mongoToken,
          'Platform-Token': req.accessToken
        }
      })
      const actuallyFullProduct = JSON.parse(fullProduct).result
      await createSendoProduct(actuallyFullProduct, { store_id })
    }))

    const sendoProducts = await SendoProduct.find({ storageId })

    return res.status(200).send(sendoProducts)
  } catch(error) {
    if (error.response) {
      const errorSerialized = {
        code: error.response.statusCode,
        message: error.response.statusMessage,
      }

      return res.status(errorSerialized.code).send(Error(errorSerialized))
    }
    console.log("Fetch error: ", error.message)
    return res.status(400).send(Error({ message: "Unknown" }))
  }
}

module.exports.pushProducts = async (req, res) => {
  console.log("log request: ", req)
  res.sendStatus(200)
}

module.exports.syncProducts = async (req, res, next) => {
  const { payload } = req.body
  //check
  console.clear()
  let newCredential = null;
  try { 
    newCredential = await rp({
      method: 'POST',
      url: 'http://localhost:5000/api/sendo/login',
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': payload.access_token
      },
      body: {
        credential: payload
      },
      json: true
    })

  } catch(e) {
    console.log(e.message)
    return res.status(400).send(Error({ message: 'Lấy sendo token thất bại !'}))
  }

  console.log("new cre: ", newCredential)

  //fetch products
  try {
    const options = {
      method: 'POST',
      url: 'http://localhost:5000/sendo/products/fetch',
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': newCredential.access_token
      },
      body: {
        store_id: payload.store_id
      },
      json: true
    }

    await rp(options, function(err, response) {
      return res.status(200).send("Đồng bộ sendo thành công !")
    })
  } catch(e) {
    console.log("sync error: ", e.message)
    return res.status(e.response.statusCode).send(Error({ message: e.response.statusMessage}))
  }

}