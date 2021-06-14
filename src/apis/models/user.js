const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const schema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  lastSeen: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  storages: [
    {
      storage: {
        storageId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        storageName: {
          type: String
        },
        role: {
          type: String,
        },
        roleAccess: {
          type: [String]
        },
        current: {
          type: Boolean,
          default: false,
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
  pendingRequest: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId
    },
    displayName: {
      type: String,
    },
    storageId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    storageName: {
      type: String
    },
    role: {
      type: String,
    },
    roleAccess: {
      type: [String]
    }
  }]
});

schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const currentStorage = userObject.storages.find(i => i.storage.current === true).storage

  userObject.currentStorage = currentStorage
  delete userObject.tokens
  delete userObject.password
  delete userObject.isDeleted
  
  return userObject;
};

// generate jwt
schema.methods.generateJWT = async function () {
  const user = this;
  const token = jwt.sign({ 
    _id: user._id.toString(),
    currentStorage: user.storages.find(i => i.storage.current === true).storage
  }, "thuongthuong", {
    expiresIn: '30d'
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// check login
schema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login!");
  }

  const isMatch = await bcrypt.compare(password, user.password);


  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// hash the password before saving
schema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", schema);

module.exports = User;
