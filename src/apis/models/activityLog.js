const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const schema = new Schema({
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userName: {
    type: String,
  },
  userRole: {
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

schema.methods.toJSON = function () {
  const activity = this;
  const activityObject = activity.toObject();
  const mapping = {
    'Seller': 'Chủ cửa hàng',
    'Employee': 'Nhân viên',
  }

  activityObject.userRole = mapping[activityObject.userRole]

  return activityObject;
};

const ActivityLog = mongoose.model("ActivityLog", schema);

module.exports = ActivityLog;
