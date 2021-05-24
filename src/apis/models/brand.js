const mongoose = require("mongoose");
const mongooseFuzzySearching = require('mongoose-fuzzy-searching')

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  id: {
    type: String,
  },
  global_identifier: {
    type: String,
  },
  name: {
    type: String,
  },
  name_en: {
    type: String,
  },
})

BrandSchema.plugin(mongooseFuzzySearching, { fields: [{
  name: 'name',
  minSize: 3
}] })

module.exports = mongoose.model("Brand", BrandSchema);