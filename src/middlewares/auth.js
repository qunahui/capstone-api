const jwt = require("jsonwebtoken");
const User = require("../apis/models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thuongthuong");
    const user = await User.findOne({
      uid: decoded.uid,
    });
        
    if (!user) {
      throw new Error();
    }

    if(!user.tokens.some(e => e.token === token)){
      console.log("not included: ", token)
      return res.status(401).send("Token expired");
    }

    req.token = token;
    req.user = user;
    next();

  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
