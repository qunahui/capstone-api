const Storage = require("../models/storage")
const auth = require("../../middlewares/auth");
const { getSendoToken } = require("./sendo");

module.exports.getStorages = async (req, res) => {
  let storage = await Storage.findById({ _id: req.user.currentStorage.storageId })
  if(!storage) {
    storage = {}
  }
  let sendoCredentials = storage.sendoCredentials || []
  sendoCredentials = await Promise.all(sendoCredentials.map(async sendoCredential => await getSendoToken(sendoCredential)))
  storage.sendoCredentials = sendoCredentials
  await Storage.findOneAndUpdate({ _id: storage.id }, storage)
  res.status(200).send({ storage })
  // update token
};

module.exports.fetchShops = async (req, res) => {
};


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

