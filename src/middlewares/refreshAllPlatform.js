const Error = require("../apis/utils/error")
const Storage = require("../apis/models/storage")
const timeDiff = require("../apis/utils/timeDiff")
const rp = require('request-promise')

const auth = async (req, res, next) => {
  const { storageId } = req.user.currentStorage
  try {
    const storage = await Storage.findOne({ _id: storageId }) 
    let creds = []
    creds = creds.concat(storage.sendoCredentials).concat(storage.lazadaCredentials)
    await Promise.all(creds.map(async cred => {
      await rp({
        method: 'POST',
        url: `${process.env.API_URL}/api/${cred.platform_name}/login`,
        headers: {
          Authorization: 'Bearer ' + req.mongoToken,
          'Platform-Token': cred.access_token
        },
        body: {
          credential: cred
        },
        json: true
      })
    }))
    next()
  } catch(e) {
    console.log(e.message)
    res.status(500).send(Error({ message: `Refresh all token failure, ${e.message}` }))
  }
};
module.exports = auth;
