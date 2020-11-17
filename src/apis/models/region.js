const { Int32 } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const regionSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: Array,
        required: true
    }
  });



module.exports = mongoose.model("Region", regionSchema);
