const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    store_id:{
        type: String
    },
    id:{
        type: String,
        unique: true
    },
    name:{
        type: String
    },
    store_sku:{
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
    avatar:{
        type: String
    },
    // variants:{
    //   type: Array
    // },
    // attributes:{
    //     type: Array
    // },
    voucher:{
        type: Object
    },
  }
);

schema.virtual("variant",{
  ref:"variant",
  localField: "_id",
  foreignField: "flatformId"
})

module.exports = mongoose.model("sendoProduct", schema);
