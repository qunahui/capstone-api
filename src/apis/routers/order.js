const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const orderController = require("../controllers/order");
const RefundOrder = require("../models/order")
const Order  = require("../models/order") 
const Storage = require("../models/storage")
var cron = require('node-cron');
var task 
function logName(name){
    task = cron.schedule('*/10 * * * * *', async() => {
        const storages = await Storage.find()
        console.log(storages)
      },{
        scheduled: false
    });

    task.start()
}
function stoplogName(){
    task.stop()
}
router.get("/", auth, orderController.getAllOrder)

router.get("/:id", auth, orderController.getOrderById)

router.post("/", auth, orderController.createOrder)

router.post("/lazada", auth, orderController.createLazadaOrder)

router.post("/sendo", auth, orderController.createSendoOrder)

router.get("/cancel/:_id", auth, orderController.cancelOrder)

router.post("/pack/:_id", auth, orderController.createPackaging)

router.post("/receipt/:_id", auth, orderController.createReceipt)

router.post("/payment/:_id", auth, orderController.updatePayment)

router.get("/cron/:name", async (req,res)=>{
    const name = req.params.name

    logName(name)

    res.send(name)
})
router.delete("/cron/stop", async (req,res)=>{


    stoplogName()

    res.send("stop") 
})
module.exports = router;
