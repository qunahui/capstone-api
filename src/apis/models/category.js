const mongoose = require("mongoose");
const mongooseFuzzySearching = require('mongoose-fuzzy-searching')

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    category_id:{
        type: Number
    },
    var:{
        type: Boolean
    },
    name:{
        type: String
    },
    leaf:{
          type: Boolean
    },
    idpath:{
        type: Array
    },
    namepath: {
      type: Array
    }
})

CategorySchema.plugin(mongooseFuzzySearching, { fields: [{
  name: 'name',
  minSize: 3
}] })

module.exports = mongoose.model("Category", CategorySchema);