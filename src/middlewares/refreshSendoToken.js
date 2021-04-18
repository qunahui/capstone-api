const Error = require("../apis/utils/error")
const Storage = require("../apis/models/storage")
const timeDiff = require("../apis/utils/timeDiff")

const auth = async (req, res, next) => {
  try {
    // const sendoToken = req.accessToken;
    const { credential } = req.body
    const timeDifference = timeDiff(new Date(), new Date(credential.expires))
    const isTokenAvailable = timeDifference.hoursDifference <= 0
    
    if(isTokenAvailable === true) {
      next();
    }
    
    const { app_key, app_secret } = credential
      const response = await rp({
        method: 'POST',
        url: 'https://open.sendo.vn/login',
        header: {
          'Content-Type' : 'application/json'
        },
        json: true,
        body: {
          shop_key: app_key,
          secret_key: app_secret
        }
      })

      const { token, expires } = response.result

      await Storage.updateOne({ 
        _id: currentStorage.storageId,
        sendoCredentials: {
          $elemMatch: {
            _id: credential._id,
            store_id: credential.store_id
          }
        }
      } , {
        $set: {
          "sendoCredentials.$.access_token": token,
          "sendoCredentials.$.expires": expires,
        }
      })

      
      const newStorage = await Storage.findOne({
        id: currentStorage.storageId,
        sendoCredentials: {
          $elemMatch: {
            _id: credential._id,
            store_id: credential.store_id
          }
        }
      }).lean()

      const newCredential = newStorage.sendoCredentials.find(i => i._id.toString() === credential._id)

      req.body.credential = newCredential

      next()
  } catch (e) {
    res.status(401).send(Error({
      message: "Please authenticate."
    }));
  }
};

module.exports = auth;
