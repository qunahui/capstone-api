const { Decimal128, Timestamp, ObjectId, ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const inventorySchema = new Schema({
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  actionName: {
    type: String,
    required: true
  },
  change: {
    amount: {
      type: String
    },
    type: {
      type: String //tăng, giảm
    }
  },
  instock: {
    type: Number
  },
  reference: {
    type: String,
  },
  price: {
    type: Number
  },
  department: {
    type: String,
    default: 'Chi nhánh mặc định'
  },
  createdAt: {
    type: Date,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    // updatedAt: 'updatedAt',
  }
});


module.exports = mongoose.model("Inventory", inventorySchema);
