const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const variantSchema = new Schema({
  avatar: {
    type: String,
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

const productSchema = new Schema({
  avatar: [{
    type: String,
  }],
  avatarList: {
    type: String,
  },
  brand: { 
    type: String,
    default: 'No Brand',
  },
  categoryId: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  description:{
    type: String,
  },
  name:{
    type: String,
    required: true,
    ref: 'productName'
  },
  options: [{
    optionName: {
      type: String,
    },
    optionValue: [String],
  }],
  productType: {
    type: String,
    default: 'Normal',
  },
  weightValue: {
    type: Number,
    required: true,
  },
  weightUnit: {
    type: String,
    required: true,
  },
  sellable: {
    type: Boolean,
    required: true
  },
  sku: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
  },
  createdBy: {
    type: String,
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
  },
  variants: [variantSchema],
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
});

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("Product", productSchema);
