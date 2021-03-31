const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    linkedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant'
    },
    store_id:{
        type: String
    },
    id:{
        type: String,
        unique: true
    },
    price: {
        type: Number,
    },
    name:{
        type: String
    },
    sku:{
        type: String
    },
    weight:{
        type: Number
    },
    stock_quantity:{
        type: Number
    },
    stock_availability:{
        type: Boolean
    },
    status:{
        type: String
    },
    updated_date_timestamp:{
        type: Date
    },
    created_date_timestamp:{
        type: Date
    },
    link:{
        type: String
    },
    unit:{
        type: String
    },
    unitId: {
        type: Number
    },
    avatar:{
        type: String
    },
    voucher:{
        type: Object
    },
  }
);

schema.virtual("variants",{
  ref: "SendoVariant",
  localField: "_id",
  foreignField: "productId"
})

schema.virtual("linkedDetails",{
  ref: "Variant",
  localField: "linkedId",
  foreignField: "_id",
  justOne : true
})

module.exports = mongoose.model("sendoProduct", schema);
