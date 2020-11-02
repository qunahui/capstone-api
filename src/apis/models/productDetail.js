const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "product",
  },
  size: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  photoURL: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("productDetail", schema);
