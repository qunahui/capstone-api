const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  productID: {
    type: mongoose.ObjectId,
  },
  memberID: {
    type: mongoose.ObjectId,
  },
  memberName: {
    type: String,
  },
  comment: {
    type: String,
  },
  rating: {
    type: Number,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("comments", schema);
