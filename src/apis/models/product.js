const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const variantSchema = new Schema({
  id:{
    type: String
  },
  name:{
    type: String
  },
  sku:{
    type: String
  },
  price:{
    type: Number
  },
  weight:{
    type: String
  },
  quantity:{
    type: Number
  },
  variant_attributes:{
    type: Array
  }
})

const productSchema = new Schema({
   name:{
     type: String
   },
   description:{
     type: String
   },
   avatar:{
     type: String
   },
  //  created_date_timestamp:{
  //    type: Date
  //  },
  //  updated_date_timestamp:{
  //    type: Date
  //  },
   variants: [variantSchema]
   
  }
);

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("Product", productSchema);
