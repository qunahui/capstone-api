const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const productSchema = new Schema({
    store_ids:{
      type: Array
    },
    sendo_product_id: {
      type: Number,
      unique: true
    },
    lazada_product_id:{
      type: Number,
      unique: true
    },
    store_id:{
      type: Number
    },
    store_name:{
      type: String
    },
    name: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      trim: true
    },
    price:{
      type: Decimal128
    },
    weight:{
      type: Decimal128
    },
    stock_availability:{
      type: Boolean
    },
    stock_quantity:{
      type: Number
    },
    description:{
      type: String
    },
    sendo_cat4_id:{
      type: Number
    },
    sendo_product_status:{
      type: Number
    },
    lazada_product_status:{
      type: String
    },
    tags: {
      type: String
    },
    updated_date_timestamp:{
      type: Date
    },
    created_date_timestamp:{
      type: Date
    },
    sendo_product_link:{
      type: String
    },
    product_image: {
      type: String
    },
    category_4_name: {
      type: String,
      trim: true
    },
    sendo_updated_user:{
      type: String,
      trim: true
    },
    url_path:{
      type: String,
      trim: true
    },
    height_product:{
      type: Decimal128
    },
    length_product:{
      type: Decimal128
    },
    width_product:{
      type: Decimal128
    },
    unit_id:{
      type: Number
    },
    avatar:{
      type: Object
    },
    
    // product_pictures:{
    //   type: Array
    // },
    attributes: {
      type: Array
    },
    special_price:{
      type: Decimal128
    },
    promotion_from_date_timestamp:{
      type: Date
    },
    promotion_to_date_timestamp:{
      type: Date
    },
    is_promotion:{
      type: Boolean
    },
    extended_shipping_package:{
      type: Object
    },
    variants:{
      type: Array
    },
    is_config_variant:{
      type: Boolean
    },
    is_invalid_variant:{
      type: Boolean
    },
    voucher:{
      type: Object
    },
    // product_category_types:{
    //   type: Array
    // },
    is_flash_sales:{
      type: Boolean
    },
    campaign_status:{
      type: Number,
    },
    can_edit:{
      type: Boolean
    }
    // sendo_video:{
    //   type: Array
    // }
    // installments:{
    //   type: Array
    // }
  }
);

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("Product", productSchema);
