const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const variantSchema = new Schema({
  // chung
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
  platformId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "lazadaProduct"
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
  Url:{
    type: String
  }
})




module.exports = mongoose.model("lazadaVariant", variantSchema);
