const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const sendoVariantSchema = new Schema({
  linkedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  avatar: {
    type: String
  },
  variant_attributes: {
    type: Array,
  },
  variant_is_promotion: {
    type: Boolean,
  },
  variant_sku: {
    type: String,
  },
  variant_price: {
    type: Number,
  },
  variant_special_price: {
    type: Number,
  },
  variant_quantity: {
    type: Number,
  },
  variant_is_flash_sales: {
    type: Boolean,
  },
  variant_campaign_status: {
    type: Number,
  },
  variant_promotion_start_date_timestamp: {
    type: Number,
  },
  variant_promotion_end_date_timestamp: {
    type: Number,
  },
  variant_attribute_hash: {
    type: String,
  },
})

const schema = new Schema({
    store_id:{
        type: String
    },
    id:{
        type: String,
        unique: true
    },
    price: {
      type: Number,
    },
    name:{
        type: String
    },
    sku:{
        type: String
    },
    weight:{
        type: Number
    },
    stock_quantity:{
        type: Number
    },
    stock_availability:{
        type: Boolean
    },
    status:{
        type: String
    },
    updated_date_timestamp:{
        type: Date
    },
    created_date_timestamp:{
        type: Date
    },
    link:{
        type: String
    },
    unit:{
        type: String
    },
    unitId: {
      type: Number
    },
    avatar:{
        type: String
    },
    variants:{
      type: [sendoVariantSchema]
    },
    linkedId: {
      type: mongoose.Schema.Types.ObjectId
    },
    voucher:{
        type: Object
    },
  }
);

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })



module.exports = mongoose.model("sendoProduct", schema);
