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
    required: true,
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

const schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
    default: 'SHOP_SYNC'
  },
  platformCredentials: {
    type: [platformCredentialSchema]
  },
  totalMoney: {
    type: Float32Array,
    default: 0,
  },
  isActivated: {
    type: Boolean,
    default: true,
  },
});

schema.virtual("platformTokens", {
  ref: "platformToken",
  localField: "uid",
  foreignField: "uid"
})

schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.tokens;
  delete userObject._id;
  delete userObject.isDeleted;
  
  return userObject;
};

// generate jwt
schema.methods.generateJWT = async function () {
  const user = this;
  const token = jwt.sign({ uid: user.uid.toString() }, "thuongthuong", {
    expiresIn: '30d'
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// check login
schema.statics.findByCredentials = async (uid) => {
  var user = await User.findOne({ uid });
  
  if (!user) {
    throw new Error("Unable to login!");
  }
  
  return user;
};


const User = mongoose.model("User", schema);

module.exports = User;
