const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const variantSchema = new Schema({
  // chung
  linkedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant'
  },
  variant_attributes:{
    type: Array
  },
  sku:{
    type: String
  },
  Status:{
    type: String // can nhac
  },
  price:{
    type: Number
  },
  special_price:{
    type: Number
  },
  quantity:{
    type: Number
  },
  avatar:{
    type: Array
  },
  productId:{
    type: String,
    required: true,
    ref: "sendoProduct"
  },
  //rieng
  //sendo
  variant_is_promotion:{
    type: Boolean
  },
  special_price:{
    type: Number
  },
  variant_promotion_start_date_timestamp:{
    type: Date
  },
  variant_promotion_end_date_timestamp:{
    type: Date
  },
  variant_is_flash_sales:{
    type: Boolean
  },
  variant_campaign_status:{
    type: String
  },
  variant_attribute_hash:{ // quan trong
    type: String
  },
})

variantSchema.virtual("linkedDetails",{
  ref: "Variant",
  localField: "linkedId",
  foreignField: "_id",
  justOne : true
})

module.exports = mongoose.model("sendoVariant", variantSchema);
