const e = require("express");
const jwt = require("jsonwebtoken");
const User = require("../apis/models/user");
const Error = require("../apis/utils/error")

const auth = async (req, res, next) => {
  try {
    const mongoToken = req.header("Authorization").replace("Bearer ", "");
    const platformToken = req.header("Platform-Token");
    const decoded = jwt.verify(mongoToken, "thuongthuong");
    let user = await User.findOne({
      _id: decoded._id,
      "tokens.token": mongoToken,
    });

    user.lastSeen = new Date()
    await user.save()

    if (!user) {
      return res.status(401).send(Error({
        message: "Please authenticate."
      }));
    }

    if(!user.tokens.some(e => e.token === mongoToken)){
      console.log("not included: ", mongoToken)
      return res.status(401).send(Error({
        message: e.message
      }));
    }

    user.currentStorage = user.storages[0].storage
    delete user.storages
    
    
    req.user = user
    req.accessToken = platformToken
    req.mongoToken = mongoToken
    
    next();

  } catch (e) {
    res.status(401).send(Error({
      message: "Please authenticate."
    }));
  }
};

module.exports = auth;
