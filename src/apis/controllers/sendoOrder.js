const auth = require("../../middlewares/auth");
const sendoOrder = require("../models/sendoOrder");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const util = require('util')

module.exports.getAllSendoOrder = async (req, res) => {
  try {
    
    const sendoOrders = await sendoOrder.find({})
    
    res.send(products)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.createSendoOrder = async (req, res) => {
    //const item = req.body.data;
    //util.inspect(item, false, null, true /* enable colors */)
    console.log("Reviced req")
  
  };