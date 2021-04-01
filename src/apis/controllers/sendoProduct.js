const SendoProduct = require("../models/sendoProduct");
const Error = require("../utils/error");
const rp = require('request-promise');
const timeDiff = require("../utils/timeDiff");
const SendoVariant = require("../models/sendoVariant")
const Storage = require("../models/storage")
const Variant = require("../models/variant")
const mongoose = require("mongoose")

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
    }); 
    variants.forEach(e => {
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
          ...item,
          store_id: store_id,
          unit: unit[item.unit_id - 1],
          unitId: item.unit_id,
          avatar: item.avatar.picture_url,
          updated_date_timestamp: update_at,
          created_date_timestamp: create_at,
          //attributes: attributes,
        },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
    const sendoProduct = await SendoProduct.findOneAndUpdate(query, update, options)
    //find sendoVariants in db
    const sendoVariants = await SendoVariant.find({productId: sendoProduct._id})
    
    //remove sendoVariants not in variants
    if(sendoVariants){
      sendoVariants.forEach(async (sendoVariant) =>{
        const i = variants.findIndex(x => x.variant_attribute_hash === sendoVariant.variant_attribute_hash)
        console.log("index: ", i)
        if(i < 0){
          const deleted = await SendoVariant.findOneAndDelete({_id: sendoVariant._id}, { lean: true})
          if(deleted.linkedId) {
            await Variant.updateOne({
              _id: deleted.linkedId,
            }, {
              $pull: {
                linkedIds: mongoose.Types.ObjectId(deleted._id)
              }
            })
          }
        }
      })
    }
    //create or update
    variants.forEach(async (variant)=>{
      await SendoVariant.findOneAndUpdate({ variant_attribute_hash: variant.variant_attribute_hash, productId: sendoProduct._id}, {
        ...variant,
        sku: variant.variant_sku,
        Status: item.status === '2' ? 'active' : 'inactive',
        price: variant.variant_price,
        special_price: variant.variant_special_price,
        quantity: variant.variant_quantity,
        productId: sendoProduct._id
      }, options)
    })
  } catch(e) { 
    console.log("Error: ", e)
  }
};

module.exports.createSendoProduct = createSendoProduct


module.exports.getAllProducts = async (req, res) => {
  try {
    const { storeIds } = req.query;
    let sendoProducts = []
    await Promise.all([...storeIds].map(async storeId => {
      const products = await SendoProduct.find({ store_id: storeId }).populate({
        path: 'variants',
        populate: {
          path: 'linkedDetails'
        }
      }).populate('linkedDetails').lean()

      sendoProducts = [...sendoProducts, ...products]
    }))

    return res.status(200).send(sendoProducts)
  } catch(e) {
    console.log("err: ", e.message)
    return res.status(500).send(Error({ message: 'Something went wrong !'}))
  }
}

module.exports.fetchWithoutAuth = async (req, res) => {
  const options = {
      'method': 'POST',
      'url': 'https://open.sendo.vn/api/partner/product/search',
      'headers': {
        'Authorization': 'bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYxNzE5NjI1OCwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.TY0jlpnyQaYgUx__JDZkRGqr7-4efwwLC5WnOTd8i-8",
        'Content-Type': 'application/json',
        'cache-control': 'no-cache'
      },
      body: JSON.stringify({"page_size":10,"product_name":"","date_from":"2020-05-01","date_to":"9999-10-28","token":"", "status" : -1})
  };
  const response = await rp(options)
  const products = JSON.parse(response).result.data
  res.status(200).send(products)
}

module.exports.fetchProducts = async (req, res) => {
  const { store_id, lastSync } = req.body
  const { storageId } = req.user.currentStorage
  const sendoFormatDate = lastSync && lastSync.split('T')[0] 
  try {
    const options = {
        'method': 'POST',
        'url': 'https://open.sendo.vn/api/partner/product/search',
        'headers': {
          'Authorization': 'bearer ' + req.accessToken,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({"page_size":100,"product_name":"","date_from": sendoFormatDate || "2021-01-01","date_to":"9999-10-28","token":"", "status": sendoFormatDate && -1,})
    };
    const response = await rp(options)
    console.log(JSON.parse(response).result)
    const products = JSON.parse(response).result.data // product đã xóa, product ko update,  product update
    await Promise.all(products.map(async product => {
      // xóa product trong db
      if(product.status === 5){
        const sendoProduct = await SendoProduct.findOneAndDelete({id: product.id, store_id}, {lean: true})
        if(sendoProduct){
          await SendoVariant.deleteMany({ productId: sendoProduct._id })
        }
      }else if(product.status === 2){ // update or create product
        const sendoProduct = await SendoProduct.findOne({ id: product.id, store_id })
        if(sendoProduct) {
          const secondDiff = timeDiff(new Date(product.updated_at_timestamp*1000), new Date(sendoProduct.updated_date_timestamp)).secondsDifference
          if(secondDiff === 0) {  //loại bỏ các product ko có update mới
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
        await createSendoProduct(actuallyFullProduct, { store_id }) // create nếu ko có product, update nếu secondDiff > 0
      }
     
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
  const { storageId } = req.user.currentStorage
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
        store_id: payload.store_id,
        lastSync: newCredential.lastSync
      },
      json: true
    }

    await rp(options)

    await Storage.updateOne({ 
      _id: storageId,
      sendoCredentials: {
        $elemMatch: {
          _id: newCredential._id,
          store_id: newCredential.store_id
        }
      }
    } , {
      $set: {
        "sendoCredentials.$.lastSync": new Date(),
      }
    })

    return res.status(200).send({
      message: "Đồng bộ sendo thành công !",
      isCredentialRefreshed: newCredential.isCredentialRefreshed
    })
  } catch(e) {
    console.log("sync error: ", e.message)
    return res.status(e.response.statusCode).send(Error({ message: e.response.statusMessage}))
  }

}

module.exports.createProduct = async (req, res) =>{
  try {
    const {variants} = req.body
    const sendoVariants = await SendoVariant.find({productId: "6062fcccbe681538acbbac81"})
   
    sendoVariants.forEach(async (sendoVariant) =>{
      const i = variants.findIndex(x => x.variant_attribute_hash === sendoVariant.variant_attribute_hash)
      if(i < 0){
        await SendoVariant.findOneAndDelete({_id: sendoVariant._id})
      }
    })
   
    res.send("done") 

  } catch(e) { 
    console.log("Error: ", e)
  }
}

module.exports.getProductById = async (req, res) =>{
  const id = req.params.id
  const sendoproduct = await SendoProduct.findOne({_id: id}).populate('variants').lean()

  res.send(sendoproduct)
}

