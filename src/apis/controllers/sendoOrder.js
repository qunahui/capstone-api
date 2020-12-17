const auth = require("../../middlewares/auth");
const sendoOrder = require("../models/sendoOrder");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const util = require('util')

module.exports.getAllSendoOrder = async (req, res) => {
  try {
    
    const sendoOrders = await sendoOrder.find({})
    
    res.send(sendoOrders)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.createSendoOrder = async (req, res) => {
  const item = req.body;
  const order = new sendoOrder({
    sales_order: item.sales_order,
    sku_details: item.sku_details,
    sales_order_details: item.sales_order_details,
    order_number: item.order_number,
    total_amount: item.total_amount,
    order_id: item.id
  })
  try {
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
  }
  };

module.exports.getSendoOrderById= async (req,res) =>{
  try {
    const orderNumber = req.params.orderNumber;
    const order = await sendoOrder.find({'order_number': orderNumber})
    
    res.send(order)
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.deleteSendoOrder = async (req, res) =>{
  // isDelete = true?
  
}