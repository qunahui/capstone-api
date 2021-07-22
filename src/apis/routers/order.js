const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const refreshAllPlatform = require("../../middlewares/refreshAllPlatform");
const orderController = require("../controllers/order");
const rp = require("request-promise")
const User = require('../models/user')
const Storage = require("../models/storage")
var cron = require('node-cron');

router.use(auth) //all requests to this router will first hit this middleware

function fetchOrderCron(){
  let count = 1
    task = cron.schedule('*/10 * * * * *', async () => {
      console.log("Fetch orders cron is running....")
      console.log("Cron index: ", count++)
      const autoSyncStorages = await Storage.find({ autoSync: true })
      await Promise.all(autoSyncStorages.map(async (str) => {
        const matchedUser = await User.findOne({ 'storages.0.storage.storageId': str._id })
        const option = {
          method: 'GET',
          url: `${process.env.API_URL}/orders/fetch`,
          headers: {
            'Authorization': 'Bearer ' + matchedUser.tokens[matchedUser.tokens.length - 1].token
          }
        }
        await rp(option)
      }))

      console.log("done")
    },{
      // scheduled: false
  });

  // task.start()
}

// fetchOrderCron()


router.post("/confirm-platform-order", orderController.confirmPlatformOrder)

router.get("/", orderController.getAllOrder)

router.get("/marketplace", orderController.getAllMarketplaceOrder)

router.get("/fetch", refreshAllPlatform, orderController.fetchApiOrders)

router.get("/:_id", orderController.getOrderById) //objectId

router.post("/", orderController.createMMSOrder)

router.post("/lazada", orderController.createLazadaOrder)

router.post("/sendo", orderController.createSendoOrder)

router.post('/sendo/refund', orderController.createSendoRefundOrder)

router.get("/cancel/:_id", orderController.cancelOrder)

router.post("/pack/:_id", orderController.createPackaging)

router.post("/receipt/:_id", orderController.createReceipt)

router.post("/payment/:_id", orderController.updatePayment)

router.post("/print-bill/", orderController.printBill)

router.post("/delivery/:_id", orderController.confirmDelivery)

module.exports = router;
