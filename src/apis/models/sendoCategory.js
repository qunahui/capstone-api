const mongoose = require("mongoose");
const mongooseFuzzySearching = require('mongoose-fuzzy-searching')

const Schema = mongoose.Schema;

const schema = new Schema({
    category_id:{
        type: Number
    },
    name: {
      type: String
    },
    idpath:{
        type: Array
    },
    namepath: {
      type: Array
    },
    leaf:{
        type: Boolean,
        default: false
    },

})

schema.plugin(mongooseFuzzySearching, { fields: [{
  name: 'name',
  minSize: 3
}] })

module.exports = mongoose.model("SendoCategory", schema);