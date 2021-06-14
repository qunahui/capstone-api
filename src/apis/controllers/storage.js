const Storage = require("../models/storage")
const SendoProduct = require("../models/sendoProduct")
const SendoVariant = require("../models/sendoVariant")
const ActivityLog = require("../models/activityLog")
const { Order } = require('../models/order')
const rp = require('request-promise')

module.exports.getStorages = async (req, res) => {
  let storage = await Storage.findOne({ _id: req.user.currentStorage.storageId })
  if(!storage) {
    storage = {}
  }

  res.status(200).send({ storage })
  // update token
};

module.exports.getActivities = async (req, res) => {
  try {
    const activityLog = await ActivityLog.find({
      storageId: req.user.currentStorage.storageId
    }).sort([['createdAt', 'descending']])

    res.status(200).send(activityLog)
  } catch(e) {
    console.log("Get activity failed: ", e.message)
    res.status(500).send(Error({ message: 'Có gì đó sai sai !'}))
  }
}

module.exports.disconnectStore = async (req, res) => {
  const store = req.body
  const storage = await Storage.findById(req.user.currentStorage.storageId)

  if(store.platform_name === 'sendo') {
    storage.sendoCredentials = storage.sendoCredentials.filter(i => i.store_id !== store.store_id)
    const sendoProduct = await SendoProduct.find({ store_id: store.store_id })

    console.log(sendoProduct)
    
    await Order.deleteMany({ store_id: store.store_id })

    await Promise.all(sendoProduct.map(async prod => {
      await SendoVariant.deleteMany({ productId: prod._id })
    }))

    await SendoProduct.deleteMany({ store_id: store.store_id })
  } else if(store.platform_name === 'lazada') {
    storage.lazadaCredentials = storage.lazadaCredentials.filter(i => i.store_id !== store.store_id)
  }

  await storage.save()

  res.status(200).send(storage)
}

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

