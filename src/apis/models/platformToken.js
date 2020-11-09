const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  uid: {
    type: String,
    required: true,
    ref: "User"
  },
  platform: {
    type: String,
    required: String
  },
  token: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '20s' // this is just for testing, default: 8h
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const PlatformToken = mongoose.model("PlatformToken", schema);

module.exports = PlatformToken;
