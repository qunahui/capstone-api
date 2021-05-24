const e = require("express");
const Storage = require("../apis/models/storage")

module.exports.check =  async (req, res, next) => {
    const store_id = req.query.store_id
    const storage =  await Storage.findOne({"sendoCredentials.store_id": store_id}, {sendoCredentials: 1})
    storage.sendoCredentials.forEach(store => {
        if(store.store_id == store_id)
        {
            req.accessToken = store.access_token
            next()
        }
    });
}

module.exports.check1 =  async (req, res, next) => {
    const store_id = req.query.store_id
    const storage =  await Storage.findOne({"lazadaCredentials.store_id": store_id}, {lazadaCredentials: 1})
    storage.lazadaCredentials.forEach(store => {
        if(store.store_id == store_id)
        {
            req.accessToken = store.access_token
            next()
        }
    });
}
module.exports.check2 =  async (req, res, next) => {
    const store_id = req.query.store_id
    const storage =  await Storage.findOne({"lazadaCredentials.store_id": store_id}, {lazadaCredentials: 1})
    storage.lazadaCredentials.forEach(store => {
        if(store.store_id == store_id)
        {
            req.refreshToken = store.refresh_token
            next()
        }
    });
}