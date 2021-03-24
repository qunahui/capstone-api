const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const variantSchema = new Schema({
  avatar: {
    type: String,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name:{
    type: String,
    required: true
  },
  options: [{
    optionName: {
      type: String,
    },
    optionValue: {
      type: String,
    }
  }],
  sku: {
    type: String,
    required: true
  },
  retailPrice: {
    type: Number,
    required: true
  },
  wholeSalePrice: {
    type: Number,
    required: true
  },
  importPrice: {
    type: Number,
    required: true
  },
  weightValue:{
    type: Number,
    required: true
  },
  weightUnit:{
    type: String,
    required: true
  },
  inventories: {
    initPrice: {
      type: Number,
      required: true,
    },
    initStock: {
      type: Number,
      required: true,
    },
  }, 
  linkedIds: {
    type: [mongoose.Schema.Types.ObjectId]
  }
})


module.exports = mongoose.model("Variant", variantSchema);
