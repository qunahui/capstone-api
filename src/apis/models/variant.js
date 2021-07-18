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
      default: 0,
    },
    onHand: {
      type: Number,
      default: 0,
    },
    available: {
      type: Number,
      default: 0,
    },
    incoming: {
      type: Number,
      default: 0,
    },
    onway: {
      type: Number,
      default: 0,
    },
    trading: {
      type: Number,
      default: 0,
    }
  }, 
  sellable: {
    type: Boolean,
    default: true
  },
  linkedIds: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    platform: {
      type: String
    },
    createdAt:{
      type: Date
    }
  }]
})

variantSchema.methods.toJSON = function () {
  const variant = this;
  const variantObject = variant.toObject();

  delete variantObject.__v
  
  return variantObject;
};

variantSchema.pre('save', async function (next) {
  const variant = this;

  const { onHand, trading } = variant.inventories

  variant.inventories.available = onHand - trading

  next();
});


module.exports = mongoose.model("Variant", variantSchema);
