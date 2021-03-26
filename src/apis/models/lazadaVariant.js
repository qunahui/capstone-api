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
    ref: "LazadaProduct"
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

variantSchema.virtual("linkedDetails",{
  ref: "Variant",
  localField: "linkedId",
  foreignField: "_id",
  justOne : true
})


module.exports = mongoose.model("LazadaVariant", variantSchema);
