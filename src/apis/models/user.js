const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  sendoCredentials: {
    shop_key: {
      type: String,
    },
    secret_key: {
      type: String,
    }
  },
  tokens: [
    {
      token: {
          type: String,
        }
    },
  ],
});

schema.virtual("platformTokens", {
  ref: "platformToken",
  localField: "uid",
  foreignField: "uid"
})

schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const {token} = user.sendoCredentials;
  user.sendoToken = token;

  delete userObject.tokens;
  delete userObject.sendoCredentials;

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
    console.log("Create new user")
    user = new User({ uid })
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
