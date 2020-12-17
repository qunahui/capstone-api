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
    expires: '28800' // this is just for testing, default: 8h == 28800s
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const PlatformToken = mongoose.model("PlatformToken", schema);

module.exports = PlatformToken;
