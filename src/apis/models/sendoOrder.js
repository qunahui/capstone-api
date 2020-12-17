const { Double, Decimal128 } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    store_id:{
      type: Number
    },
    order_id:{
      type: Number
    },
    order_number:{
      type: String,
      unique: true
    },
    sales_order:{
      type: Object
    },
    sku_details:{
      type: Array
    },
    sales_order_details:{
      type: Array
    },
    total_amount:{
      type: Number
    }
});

module.exports = mongoose.model("sendoOrder", schema);
