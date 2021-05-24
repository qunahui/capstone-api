const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  phone: {
    type: String,
  },
  group: {
    type: String,
    default: 'Normal'
  },
  address: {
    type: String,
    required: true,
  },
});


const Customer = mongoose.model("Customer", schema);

module.exports = Customer;
