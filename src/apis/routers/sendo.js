const express = require("express");
const request = require("request")
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/sendo");



router.post('/login', auth, controller.getSendoToken);

module.exports = router;

/*
  app.post('/api/sendo', (req, res) => {
  var options = {
    url: req.body.url,
    method: req.body.method,
    json: req.body.data
  };

  console.log(options); 

  request(options, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      console.log(response);
    }
    return res.status(500).json({ type: 'error', message: err.message });
  })
});

*/

/*
  request({
    url: 'https://open.sendo.vn/login',
    method: 'POST',
    json: {
      shop_key,
      secret_key,
    }
  }, function(err, response, body) {
    if(!err && response.statusCode === 200) {
      const { token, expires } = body.result
      const sendoToken = new PlatformToken({
        platform: 'sendo',
        userId: req.user,
        value: token,
        expires: new Date(expires)
      })

      sendoToken.save()

      return res.status(201).send({ token, expires })
    }
  })
*/