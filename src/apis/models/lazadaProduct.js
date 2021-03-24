const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    store_id:{
        type: String,
        require: true,
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

schema.virtual("variants",{
  ref:"lazadaVariant",
  localField: "_id",
  foreignField: "productId"
})

module.exports = mongoose.model("lazadaProduct", schema);
