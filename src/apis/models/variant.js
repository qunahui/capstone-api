const { Decimal128, Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const variantAttributeSchema = new Schema({
    attribute_id:{
        type: Number
    },
    attribute_code:{
        type: String
    },
    option_id:{
        type: Number
    }
    
});

const variantSchema = new Schema({   
  variant_attributes: {
    type: [variantAttributeSchema]
  },

  variant_is_promotion: {
    type: Number,
  },
  variant_sku: {
    type: String,
  },
  variant_price: {
    type: Decimal128,
  },
  variant_special_price: {
    type: Decimal128,
  },
  variant_quantity: {
    type: Number
  },
  variant_promotion_start_date_timestamp: {
    type: Timestamp,
  },
  variant_promotion_end_date_timestamp: {
    type: Timestamp,
  },
  variant_is_flash_sales: {
    type: Boolean
  },
  variant_campaign_status:{
      type: String
  },
  variant_attribute_hash:{
      type: String
  },
  message:{
      type: String
  }
});

module.exports = mongoose.model("variant", variantSchema);