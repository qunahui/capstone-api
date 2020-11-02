const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  customerID: {
    type: mongoose.ObjectId,
  },
  customerName: {
    type: String,
  },
  customerEmail: {
    type: String,
  },
  customerAddress: {
    type: String,
  },
  customerPhone: {
    type: String,
  },
  status: {
    type: String,
    default: "available",
  },
  note: {
    type: String,
  },
  total: {
    type: Number,
  },
  isDeleted: {
    type: Boolean,
  },
});

module.exports = mongoose.model("order", schema);
