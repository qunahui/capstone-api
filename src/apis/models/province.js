const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    id:{
        type: String
    },
    name:{
        type: String
    },
    type:{
        type: String
    }
})


module.exports = mongoose.model("Province", schema);