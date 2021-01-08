const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const platformCredentialSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
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
  tokens: [
    {
      token: {
          type: String,
        }
    },
  ],
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
  platformCredentials: {
    type: [platformCredentialSchema]
  },
  totalMoney: {
    type: Number,
    default: 0,
  },
  isActivated: {
    type: Boolean,
    default: true,
  },
});

// schema.methods.toJSON = function () {
//   const user = this;
//   const userObject = user.toObject()
  
//   return userObject;
// };

// generate jwt
// schema.methods.generateJWT = async function () {
//   const user = this;
//   const token = jwt.sign({ uid: user.uid.toString() }, "thuongthuong", {
//     expiresIn: '30d'
//   });

//   user.tokens = user.tokens.concat({ token });
//   await user.save();

//   return token;
// };

// 
storageSchema.pre("validate",async function (next) {
  const storage = this;

  try {
    storage.id = storage._id 
    next();
  } catch(e) {
    console.log(e)
  }
});

platformCredentialSchema.pre("validate",async function (next) {
  const platform = this;

  try {
    platform.id = platform._id 
    next();
  } catch(e) {
    console.log(e)
  }
});


const Storage = mongoose.model("Storage", storageSchema);

module.exports = Storage;
