const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const { schema } = require("./productDetail");

const productSchema = new Schema({
    id: {
      type: Number

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
    cat_4_id:{
      type: Number
    },
    status:{
      type: Number
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
    // seo:{
    //   type: String
    // },
    link:{
      type: String
    },
    relateds:{
      type: Array
    },
    seo_keyword:{
      type: String
    },
    seo_title:{
      type: String
    },
    seo_description:{
      type: String
    },
    seo_score:{
      type: String
    },
    image: {
      type: String
    },
    category_4_name: {
      type: String,
      trim: true
    },
    updated_user:{
      type: String,
      trim: true
    },
    url_path:{
      type: String,
      trim: true
    },
    video_links:{
      type: Array
    },
    height:{
      type: Decimal128
    },
    length:{
      type: Decimal128
    },
    width:{
      type: Decimal128
    },
    unit_id:{
      type: Number
    },
    avatar:{
      type: Object
    },
    pictures:{
      type: Array
    },
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
    product_category_types:{
      type: Array
    },
    is_flash_sales:{
      type: Boolean
    },
    campaign_status:{
      type: Number,
    },
    can_edit:{
      type: Boolean
    },
    sendo_video:{
      type: Array
    },
    installments:{
      type: Array
    }
  }
);

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("Product", productSchema);
