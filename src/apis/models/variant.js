const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const variantSchema = new Schema({
  // chung
  attributes:{
    type: Array
  },
  sku:{
    type: String
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
  platformId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "onModel"
  },
  onModel: {
    type: String,
    required: true,
    enum: ['sendoProduct', 'lazadaProduct']
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
  //lazada
  package_width:{
    type: String
  },
  package_height:{
    type: String
  },
  package_length:{
    type: String
  },
  package_weight:{
    type: String
  },
  Available:{
    type: String
  },
  SkuId:{
    type: Number
  },
  multiWarehouseInventories:{
    type: Array
  },
  ShopSku:{
    type: String
  },
  Status:{
    type: String // can nhac
  },
  Url:{
    type: String
  }
})




module.exports = mongoose.model("Variant", productSchema);
