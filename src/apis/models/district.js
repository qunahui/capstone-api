const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const districtSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
  });



module.exports = mongoose.model("District", districtSchema);