const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const attributeValueSchema = new Schema({
    id:{
        type: Number
    },
    value:{
        type: String
    },
    attribute_img:{
        type: String
    },
    is_selected:{
        type: Boolean
    },
    is_custom:{
        type: Boolean
    }
});

const attributeSchema = new Schema({
  attribute_id: {
    type: Number,
  },
  attribute_type: {
    type: Number,
  },
  attribute_name: {
    type: String,
  },
  attribute_is_required: {
    type: Boolean,
  },
  attribute_code: {
    type: String,
  },
  attribute_is_custom: {
    type: Boolean
  },
  attribute_is_checkout: {
    type: Boolean,
  },
  attribute_is_image: {
    type: Boolean,
  },
  attribute_values: {
    type: [attributeValueSchema]
  },
});

module.exports = mongoose.model("Attribute", attributeSchema);
