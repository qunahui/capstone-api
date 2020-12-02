const { Double, Decimal128 } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
    store_id:{
      type: Number
    },
    order_id:{
      type: Number
    },
    order_number:{
      type: String
    },
    //dia chi lay hang
    ship_from_address:{
      type: String
    },
    ship_from_ward_id:{
      type: Number
    },
    ship_from_district_id:{
      type: Number
    }
 
});

module.exports = mongoose.model("sendoOrder", schema);
