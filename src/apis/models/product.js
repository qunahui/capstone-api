const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseFuzzySearching = require('mongoose-fuzzy-searching')

const productSchema = new Schema({
  avatar: [{
    type: String,
  }],
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
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
  shortDescription: {
    type: String,
  },
  description:{
    type: String,
  },
  name:{
    type: String,
    required: true,
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
    required: true,
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
  // variants: [variantSchema],
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
});

productSchema.virtual("variants",{
  ref:"Variant",
  localField: "_id",
  foreignField: "productId"
})

productSchema.plugin(mongooseFuzzySearching, { fields: [{
  name: 'name',
  minSize: 3
}] })

module.exports = mongoose.model("Product", productSchema);
