const { any } = require("bluebird");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LazadaAttributeSchema = new Schema({
  categoryName: {
    type: String
  },
  categoryId: {
    type: Number
  },
  categoryNamepath: [{
    type: String
  }],
  attributes: [{
    id: {
      type: Number,
    },
    attribute_type: {
      type: Number,
    },
    input_type: {
      type: Number,
    },
    is_mandatory: {
      type: Boolean,
    },
    is_variant_attribute: {
      type: Boolean,
    },
    name: {
      type: String
    },
    option: [{
      type: String
    }],
    option_en: [{
        type: String
    }],
    values: {
      type: String
    }
  }]
})

module.exports = mongoose.model("LazadaAttribute", LazadaAttributeSchema);