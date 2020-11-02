const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  productID: {
    type: mongoose.ObjectId,
    require: true,
  },
  OrderID: {
    type: mongoose.ObjectId,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  orderdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("order_item", schema);
