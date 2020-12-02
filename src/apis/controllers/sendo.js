const User = require("../models/user");
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
    } else {
      return res.status(404).send(Error({ message: 'Sendo credentials not found. You must register first !'}))
    }
  } catch(e){ 
    return res.status(400).send(Error(e))
  }
}

module.exports.getSendoCategory = async (req, res) =>{
  //get den cate lv4 se include attribute
  const categoryId = req.params.id;
  try {
      const options = {
          'method': 'GET',
          'url': 'https://open.sendo.vn/api/partner/category/' + categoryId,
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjkzMDE5OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.jEWfCspUxX4j8PMPEXEVewNnyhtCwtI2KMkEHi_PSHc'
          }
        };
        request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          const categories = JSON.parse(response.body)
          res.send(categories)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}
module.exports.createSendoProduct = async (req, res) =>{
  
  const item = req.body;
  try {
      const options = {
          'method': 'POST',
          'url': 'https://open.sendo.vn/api/partner/product',
          'headers': {
            'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODU0MjE0IiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNjkzMDE5OSwiaXNzIjoiODU0MjE0IiwiYXVkIjoiODU0MjE0In0.jEWfCspUxX4j8PMPEXEVewNnyhtCwtI2KMkEHi_PSHc',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        };
      request(options, function (error, response) {
          //if (error) throw new Error(error);
          //console.log(response.body);
          //const product = JSON.parse(re)
          res.send(response.body)
        });
  } catch (e) {
      res.status(500).send(Error(e));
  }
}