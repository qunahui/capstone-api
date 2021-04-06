const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    category_id:{
        type: Number
    },
    name:{
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

module.exports = mongoose.model("SendoCategory", schema);