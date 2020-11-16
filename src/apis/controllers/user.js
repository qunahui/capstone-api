const User = require("../models/user");
const auth = require("../../middlewares/auth");
const Error = require("../utils/error");

module.exports.getCurrentUser = async (req, res) => {
  res.status(200).send({ user: req.user });
};

// module.exports.signUp = async (req, res) => {
//   try {
//     const user = new User({ ...req.body });

//     await user.save();

//     const token = await user.generateJWT();

//     res.status(201).send({user, token});
//   } catch (e) {
//     let status = 400;
//     let error = e;

//     if (e.name === "MongoError" && e.code === 11000) {
//       status = 409;
//       error = {
//         message: "User already exist!",
//       };
//     }

//     res.status(status).send(Error(error));
//   }
// };

module.exports.signIn = async (req, res) => {
  try {
    var user = await User.findByCredentials(
      req.body.uid
    );
    
    if(user.token) {
      let { token } = user
      delete user.token
      return res.send({ user: { ...rest }, token })
    }

    const token = await user.generateJWT();
    return res.send({ user, token });
  } catch (e) {
    let status = 400;
    let error = e;

    if (e.name === "MongoError" && e.code === 11000) {
      status = 409;
      error = {
        message: "User already exist!",
      };
    }

    res.status(status).send(Error(error));
  }
};

module.exports.signOut = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((item) => {
      return item.token !== req.token;
    });

    await req.user.save();
    res.status(200).send("Signed out");
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.signOutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
};

module.exports.editProfile = async (req, res) => {
  const properties = Object.keys(req.body);
  console.log(properties)

  try {
    const user = req.user;

    properties.forEach((prop) => (user[prop] = req.body[prop]));

    await user.save();
    res.send(user);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.isDeleted = true;

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
