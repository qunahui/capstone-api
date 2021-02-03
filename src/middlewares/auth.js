const e = require("express");
const jwt = require("jsonwebtoken");
const User = require("../apis/models/user");
const Error = require("../apis/utils/error")

const auth = async (req, res, next) => {
  try {
    const mongoToken = req.header("Authorization").replace("Bearer ", "");
    const platformToken = req.header("Platform-Token");
    const decoded = jwt.verify(mongoToken, "thuongthuong");
    const user = await User.findOne({
      uid: decoded.uid,
    });
    
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

    req.user = user;
    req.accessToken = platformToken
    next();

  } catch (e) {
    res.status(401).send(Error({
      message: "Please authenticate."
    }));
  }
};

module.exports = auth;
