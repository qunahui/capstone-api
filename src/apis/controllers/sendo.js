const User = require("../models/user");
const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const request = require('request');
const PlatformToken = require("../models/platformToken");

module.exports.getSendoToken = async (req, res) => {
  const platformToken = await PlatformToken.findOne({ uid: req.user.uid, platform: 'sendo'});
  if(platformToken) {
    console.log("Getting old token")
    return res.status(200).send({
      sendoToken: platformToken.token
    })
  }
  
  try {
    const { sendoCredentials: { shop_key, secret_key } } = await User.findByCredentials(req.user.uid);
    if(shop_key && secret_key) {
      request({
        url: 'https://open.sendo.vn/login',
        method: 'POST',
        json: {
          shop_key,
          secret_key,
        }
      }, async function (err, response, body) {
        if (!body.error && response.statusCode === 200) {
          const { token, expires } = body.result;
          // update user's sendo token
          await new PlatformToken({
            uid: req.user.uid,
            platform: 'sendo',
            token: token,
          }).save();
          console.log("New token created");
          return res.status(201).send({ sendoToken: token });
        }
        else if (body.error) {
          const { statusCode, error } = body;
          console.log("Error: ", body.error);
          return res.status(statusCode).send(Error(error));
        }
      })
    }
  } catch(e){ 
    return res.status(400).send(new Error(e))
  }
}