const Storage = require("../models/storage")
const auth = require("../../middlewares/auth");

module.exports.getStorages = async (req, res) => {
  const storage = await Storage.findById(req.body.storageId)
  res.status(200).send({ storage });
};

module.exports.fetchShops = async (req, res) => {
  setTimeout(() => {
  res.status(200).send("Done!");

  }, 3000)
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

