const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const schema = new Schema({
    store_id:{
        type: Number
    },
    
    product_id:{
        type: Number,
        unique: true
    },
    product_name:{
        type: String
    },
    store_sku:{
        type: String
    },
    product_weight:{
        type: Number
    },
    stock_quantity:{
        type: Number
    },
    product_status:{
        type: String
    },
    updated_date_timestamp:{
        type: Date
    },
    created_date_timestamp:{
        type: Date
    },
    product_link:{
        type: String
    },
    unit:{
        type: String
    },
    avatar:{
        type: String
    },
    variants:{
        type: Array
    },
    attributes:{
        type: Array
    },
    voucher:{
        type: Object
    }
  }
);

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("sendoProduct", schema);
