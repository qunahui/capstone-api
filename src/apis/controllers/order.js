const auth = require("../../middlewares/auth");
const Order = require("../models/order");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const rp = require('request-promise');
const util = require('util');
const { response } = require("express");

module.exports.getAllOrder = async (req, res) => {
  try {
    
    const orders = await Order.find({})
    
    res.send(orders)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};
//ping from sendo
module.exports.createOrderByPing = async (req, res) => {
  
  const item = req.body;
  const created_at = new Date(item.created_date_time_stamp * 1000)
  const wardId = item.ship_to_ward_id
  const districtId = item.ship_to_district_id
  const regionId = item.ship_to_region_id
  const ward = await rp('http://localhost:5000/api/sendo/ward/'+wardId)
  const district = await rp('http://localhost:5000/api/sendo/district/'+districtId)
  const region = await rp('http://localhost:5000/api/sendo/region/'+regionId)
  const order = new Order({
    store_id: item.store_id,
    order_number: item.order_number,
    order_status: item.order_status,
    //order infomation
    create_at: created_at,
    payment_method: item.payment_method,
    discount: item.voucher_value,
    payment_status: item.payment_status,
    seller_note: item.note,
    //shipping infomation
    delivery_service: item.carrier_name,
    tracking_number: item.tracking_number,
    shipping_fee: item.shipping_fee,
    //customer overview
    customer_name: item.ship_to_contact_name,
    customer_email: item.ship_to_contact_email,
    customer_address: item.ship_to_address
    +", "+ward
    +", "+district
    +", "+region,
    //list item
    item_list: item.sales_order_details,
  })
  try {
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
//sync from sendo
module.exports.createOrderBySyncSendo = async (req, res) => {
  
  const item = req.body;
  const created_at = new Date(item.sales_order.created_date_time_stamp * 1000)
  const districtId = item.sales_order.ship_to_district_id
  const regionId = item.sales_order.ship_to_region_id
  var district= await rp('http://localhost:5000/api/sendo/district/'+districtId)
  var region= await rp('http://localhost:5000/api/sendo/region/'+regionId)
  const order = new Order({
    store_id: item.store_id,
    order_number: item.sales_order.order_number,
    order_status: item.sales_order.order_status,
    //order infomation
    create_at: created_at,
    payment_method: item.sales_order.payment_method,
    discount: item.sales_order.voucher_value,
    payment_status: item.sales_order.payment_status,
    seller_note: item.sales_order.note,
    //shipping infomation
    delivery_service: item.sales_order.carrier_name,
    tracking_number: item.sales_order.tracking_number,
    shipping_fee: item.sales_order.shipping_fee,
    //customer overview
    customer_name: item.sales_order.receiver_name,
    customer_email: item.sales_order.receiver_email,
    customer_address: item.sales_order.ship_to_address
    +", "+item.sales_order.ship_to_ward
    +", "+district
    +", "+region,
    //list item
    item_list: item.sku_details 
  })
  try {
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
//sync from lazada
module.exports.createOrderBySyncLazada = async (req, res) => {
  
  const item = req.body;
  const stringListItem = await rp("http://localhost:5000/api/lazada/order-item/"+ item.order_number)
  const listItem = JSON.parse(stringListItem)
  const order = new Order({
    store_id: item.store_id,
    order_number: item.order_number,
    order_status: item.statuses[0],
    //order infomation
    create_at: item.created_at,
    payment_method: item.payment_method,
    discount: item.voucher,
    payment_status: item.payment_status,
    seller_note: item.note,
    //shipping infomation
    delivery_service: item.carrier_name,
    tracking_number: item.tracking_number,
    shipping_fee: item.shipping_fee,
    //customer overview
    customer_name: item.address_shipping.first_name + item.address_shipping.last_name,
    customer_email: item.address_shipping.receiver_email,
    customer_phone: item.address_shipping.phone,
    customer_address: item.address_shipping.address1
    //+", "+address_shipping.address2
    +", "+item.address_shipping.address5
    +", "+item.address_shipping.address4
    +", "+item.address_shipping.address3,

    //list item
    item_list: listItem
  })
  try {
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
module.exports.getOrderById= async (req,res) =>{
  try {
    const orderNumber = req.params.orderNumber;
    const order = await Order.find({'order_number': orderNumber})
    
    res.send(order)
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.deleteOrder = async (req, res) =>{
  // isDelete = true?
  
}