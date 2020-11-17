const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const { schema } = require("./productDetail");

const productSchema = new Schema({
    id: {
      type: Number,
      required: true
    },
    category_4_name: {
      type: String,
      trim: true,
      required: true
    },
    attributes: {
      type: Array,
      required: true
    },
    certificate_file: {
      type: Array,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    link:{
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    price:{
      type: Decimal128,
      required: true
    },
    rating:{
      type: Decimal128,
      required: true
    },
    status:{
      type: Number,
      required: true
    },
    status_name:{
      type: String,
      required: true
    },
    stock:{
      type: Boolean,
      required: true
    },
    promotion_price:{
      type: Decimal128,
      required: true
    },
    stock_quantity:{
      type: Number,
      required: true
    },
    can_delete:{
      type: Boolean,
      required: true
    },
    can_edit:{
      type: Boolean,
      required: true
    },
    can_share:{
      type: Boolean,
      required: true
    },
    can_up:{
      type: Boolean,
      required: true
    },
    sku: {
      type: String,
      trim: true,
      required: true
    },
    cate_4_id:{
      type: Number,
      required: true
    },
    store_name:{
      type: String,
      trim: true,
      required: true
    },
    is_promotion:{
      type: Boolean,
      required: true
    },
    up_product_date_timestamp:{
      type: Date
    },
    weight:{
      type: Decimal128,
      required: true
    },
    is_off:{
      type: Boolean,
      required: true
    },
    reason_comment:{
      type: String,
      trim: true
    },
    url_path:{
      type: String,
      trim: true,
      required: true
    },
    review_date_timestamp:{
      type: Date
    },
    updated_user:{
      type: String,
      trim: true,
      required: true
    },
    is_review:{
      type: Boolean,
      required: true
    },
    file_attachments:{
      type: Array,
    },
    brand_name:{
      type: String,
      trim: true
    },
    reason_code:{
      type: Number
    },
    special_price:{
      type: Decimal128,
      required: true
    },
    promotion_from_date_timestamp:{
      type: Date
    },
    promotion_to_date_timestamp:{
      type: Date
    },
    unit_id:{
      type: Number,
      required: true
    },
    updated_at_timestamp:{
      type: Date
    },
    height:{
      type: Decimal128,
      required: true
    },
    length:{
      type: Decimal128,
      required: true
    },
    width:{
      type: Decimal128,
      required: true
    },
    final_price_min:{
      type: Decimal128,
      required: true
    },
    final_price_max:{
      type: Decimal128,
      required: true
    },
    is_config_variant:{
      type: Boolean,
      required: true
    },
    variants_length:{
      type: Number,
      required: true
    },
    voucher:{
      type: Object,
      required: true
    }
  }
);

schema.virtual("productDetails",{
  ref:"productDetail",
  localField: "_id",
  foreignField: "productID"
})

module.exports = mongoose.model("Product", productSchema);
