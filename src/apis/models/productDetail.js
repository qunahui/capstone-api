const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  description: {
    type: String,
    require: true,
  },
  tags: {
    type: String,
    required: true
  },
  created_date_timestamp:{
    type: Date
  },
  seo: {
    type: String,
    required: true,
  },
  relateds: {
    type: Array,
  },
  seo_keyword: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("productDetail", schema);
