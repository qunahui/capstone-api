const e = require("express");
const jwt = require("jsonwebtoken");
const User = require("../apis/models/user");
const Error = require("../apis/utils/error")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thuongthuong");
    const user = await User.findOne({
      uid: decoded.uid,
    });
        
    if (!user) {
      return res.status(401).send(Error({
        message: "Please authenticate."
      }));
    }

    if(!user.tokens.some(e => e.token === token)){
      console.log("not included: ", token)
      return res.status(401).send(Error({
        message: e.message
      }));
    }

    req.token = token;
    req.user = user;
    next();

  } catch (e) {
    res.status(401).send(Error({
      message: "Please authenticate."
    }));
  }
};

module.exports = auth;
