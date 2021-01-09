const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const schema = new Schema({
    store_id:{
        type: Number
    },
    variants:{
        type: Array
    },
    product_id:{
        type: Number,
        unique: true
    },
    primary_category:{
        type: Number
    },
    attributes:{
        type: Object
    }
  }
);

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("lazadaProduct", schema);
