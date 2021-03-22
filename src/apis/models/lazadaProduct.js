const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const lazadaProductSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    store_id:{
        type: String,
        require: true,
    },
    variants:{
        type: Array
    },
    avatar: {
      type: String
    },
    primary_category:{
        type: String
    },
    attributes:{
        type: Object
    },
    updated_date_timestamp: {
      type: Date,
    },
    created_date_timestamp: {
      type: Date,
    },
});

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("lazadaProduct", lazadaProductSchema);
