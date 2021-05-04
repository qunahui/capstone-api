const Storage = require("../models/storage")
const rp = require('request-promise')

module.exports.getStorages = async (req, res) => {
  let storage = await Storage.findOne({ _id: req.user.currentStorage.storageId })
  if(!storage) {
    storage = {}
  }

  res.status(200).send({ storage })
  // update token
};

module.exports.fetchShops = async (req, res) => {
};

module.exports.refreshAllToken = async (req, res) => {
  const { storageId } = req.user.currentStorage

  try {
    const storage = await Storage.findOne({ _id: storageId }) 

    let creds = []

    creds = creds.concat(storage.sendoCredentials).concat(storage.lazadaCredentials)
    
    await Promise.all(creds.map(async cred => {
      let newCred = await rp({
        method: 'POST',
        url: `http://localhost:5000/api/${cred.platform_name}/login`,
        headers: {
          'Authorization': 'Bearer ' + req.mongoToken,
          'Platform-Token': cred.access_token
        },
        body: {
          credential: cred
        },
        json: true
      })

      console.log("refresh: ", newCred.store_name)
    }))

    const newStorage = await Storage.findOne({ _id: storageId }) 

    res.status(200).send(newStorage)

  } catch(e) {
    console.log(e.message)
    res.status(500).send(Error({ message: `Refresh all token failure, ${e.message}` }))
  }
}


module.exports.addSendoCredentials = async (req, res) => {
  try {
    const storage = await Storage.findById(req.body.storageId)
    console.log("Found storage: ", storage)
    const insertCredentials = {
      ...req.body,
      store_name: req.body.platform_name.toUpperCase()+ '-' + (storage.sendoCredentials.length + 1)
    }
    storage.sendoCredentials.push(insertCredentials)

    await storage.save()

    res.status(200).send(insertCredentials)

  } catch (e) {
    console.log(e)
    res.status(404).send(Error(e));
  }
};

