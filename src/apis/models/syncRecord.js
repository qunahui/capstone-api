const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const schema = new Schema({
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  syncType: {
    type: String
  },
  status: {
    type: String
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
  }
});


const SyncRecord = mongoose.model("SyncRecord", schema);

module.exports = SyncRecord;
