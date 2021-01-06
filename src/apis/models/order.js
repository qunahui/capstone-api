const { Double, Decimal128, Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const itemList = new Schema({
  
  product_variant_id: {
    type: Number
  },
  store_sku:{
    type: String
  },
  quantity:{
    type: Number
  }
})

const schema = new Schema({
    store_id:{
      type: Number
    },
    order_number:{
      type: String,
      unique: true
    },
    order_status:{
      type: String
    },
    // order infomation
    create_at:{
      type: Date
    },
    payment_method:{
      type: String
    },
    discount:{
      type: Number
    },
    payment_status:{
      type: String
    },
    seller_notes:{
      type: String
    },
    //shipping infomation
    delivery_service:{
      type: String
    },
    tracking_number:{
      type: Number
    },
    shipping_fee:{
      type: Number
    },
    //customer overview
    customer_name:{
      type: String
    },
    customer_email:{
      type: String
    },
    customer_phone:{
      type: String
    },
    customer_address:{
      type: String
    },
    //item list
    item_list: [itemList]
});

module.exports = mongoose.model("Order", schema);
