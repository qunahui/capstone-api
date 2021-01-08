const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const platformCredentialSchema = new Schema({
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
  platform_name: {
    type: String,
    required: true,
  }
})

const schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  storages: [
    {
      storage: {
        storageId: {
          type: String,
        },
        storageName: {
          type: String
        }
      }
    },
  ],
  tokens: [
    {
      token: {
          type: String,
        }
    },
  ],
});

// schema.virtual("platformTokens", {
//   ref: "platformToken",
//   localField: "uid",
//   foreignField: "uid"
// })

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

// // hash the password before saving
// schema.pre("save", async function (next) {
//   const user = this;

//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }

//   next();
// });

const User = mongoose.model("User", schema);

module.exports = User;
