const User = require("../models/user");
const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const request = require('request');
const PlatformToken = require("../models/platformToken");

module.exports.getSendoToken = async (req, res) => {
  const { token } = await PlatformToken.findOne({ uid: req.user.uid, platform: 'sendo'});
  if(token) {
    res.status(200).send({
      sendoToken: token
    })
  }
  console.log("Create new one")

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
      },async function(err, response, body) {
        if(!err && response.statusCode === 200) {
          const { token, expires } = body.result
          // update user's sendo token
          new PlatformToken({
            uid: req.user.uid,
            platform: 'sendo',
            token: token,
          }).save()

          return res.status(201).send({ sendoToken: token, message: 'Create new one' })
        }
      })
    }
  } catch(e){ 
    return res.status(400).send(new Error('Sendo credentials invalid'))
  }
}