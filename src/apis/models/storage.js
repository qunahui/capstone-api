const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sendoCredentialSchema = new Schema({
  app_key: {
    type: String,
    required: true
  },
  app_secret: {
    type: String,
    required: true
  },
  store_name: {
    type: String, 
    required: true
  },
  store_id:{ 
    type: String,
  },
  platform_name: {
    type: String,
    required: true,
  },
  isActivated: {
    type: Boolean,
    required: true,
    default: true,
  },
  access_token: {
    type: String,
    expires: '10'
  },
  status: {
    type: String,
    required: true,
    default: 'not connected yet'
  },
  priceSync: {
    type: Boolean,
    default: true,
  },
  quantitySync: {
    type: Boolean,
    default: true,
  },
  pricePolicy: {
    type: String,
    default: 'retailPrice'
  },
  expires: { 
    type: Date,
    required: true,
  },
  lastSync: {
    type: Date,
    default: null
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

const lazadaCredentialSchema = new Schema({
  store_name: {
    type: String,
  },
  store_id:{ 
    type: String,
  },
  platform_name: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
    expires: '2592000'
  },
  isActivated: {
    type: Boolean,
    required: true,
    default: true,
  },
  access_token: {
    type: String,
    expires: '604800'
  },
  status: {
    type: String,
    required: true,
    default: 'not connected yet'
  },
  priceSync: {
    type: Boolean,
    default: true,
  },
  quantitySync: {
    type: Boolean,
    default: true,
  },
  pricePolicy: {
    type: String,
    default: 'retailPrice'
  },  
  expires: { 
    type: Date,
    required: true,
  },
  refresh_expires: {
    type: Date,
    required: true
  },
  lastSync: {
    type: Date,
    default: null
  }
})

const storageSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  sendoCredentials: {
    type: [sendoCredentialSchema]
  },
  lazadaCredentials: {
    type: [lazadaCredentialSchema]
  },
  totalMoney: {
    type: Number,
    default: 0,
  },
  isActivated: {
    type: Boolean,
    default: true,
  },
  lastSync: {
    type: Date,
    default: null
  }
});

storageSchema.pre("validate",async function (next) {
  const storage = this;

  try {
    storage.id = storage._id 
    next();
  } catch(e) {
    console.log(e)
  }
});

const Storage = mongoose.model("Storage", storageSchema);

module.exports = Storage;
