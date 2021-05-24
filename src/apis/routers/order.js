const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const refreshAllPlatform = require("../../middlewares/refreshAllPlatform");
const orderController = require("../controllers/order");
const rp = require("request-promise")
const User = require('../models/user')
const Storage = require("../models/storage")
var cron = require('node-cron');
var task 

function fetchOrderCron(){
  let count = 1
    task = cron.schedule('*/15 * * * * *', async () => {
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

function stoplogName(){
    task.stop()
}

router.post("/confirm-platform-order", auth, orderController.confirmPlatformOrder)

router.get("/", auth, orderController.getAllOrder)

router.get("/marketplace", auth, orderController.getAllMarketplaceOrder)

router.get("/fetch", auth, refreshAllPlatform, orderController.fetchApiOrders)

router.get("/:id", auth, orderController.getOrderById)

router.post("/", auth, orderController.createMMSOrder)

router.post("/lazada", auth, orderController.createLazadaOrder)

router.post("/sendo", auth, orderController.createSendoOrder)

router.post('/sendo/refund', auth, orderController.createSendoRefundOrder)

router.get("/cancel/:_id", auth, orderController.cancelOrder)

router.post("/pack/:_id", auth, orderController.createPackaging)

router.post("/receipt/:_id", auth, orderController.createReceipt)

router.post("/payment/:_id", auth, orderController.updatePayment)

router.post("/print-bill/", auth, orderController.printBill)

router.delete("/cron/stop", async (req,res)=>{
    stoplogName()
    res.send("stop") 
})

router.post("/delivery/:_id", auth, orderController.confirmDelivery)

module.exports = router;
