const Error = require("../utils/error");
const { Order } = require("../models/order")
const Inventory = require("../models/inventory")
const Variant = require("../models/variant")
const Product = require('../models/product')
const rp = require('request-promise')

const checkComplete = async (_id) => {
  try {
    const order = await Order.findOne({ _id })
    const { paymentStatus, outstockStatus } = order
    if(paymentStatus === 'Đã thanh toán' && outstockStatus === true) {
      order.step[3] = {
        name: order.step[3].name,
        isCreated: true,
        createdAt: new Date()
      }
      order.orderStatus = 'Hoàn thành'
  
      await order.save()
    } 
  } catch(e) {
    console.log(e.message)
  }
}

const checkLinkedVariants = async (variant, mongoToken) => {
  try {
    await rp({ 
      method: 'POST',
      url: 'http://localhost:5000/variants/push-api',
      json: true,
      body: {
        variant
      },
      headers: { 
        'Authorization' : 'Bearer ' + mongoToken
      }
    })
  } catch(e) {
    console.log(e.message)
  }
}

module.exports.checkComplete = checkComplete

module.exports.createReceipt = async (req,res) => {
  try {
    const { lineItems } = req.body

    const order = await Order.findOne({ _id: req.params._id })
    
    await Promise.all(lineItems.map(async (item) => {
      const variantId = item._id
      const mongoVariant = await Variant.findOne({ _id : variantId })
      // const newStock = mongoVariant.inventories.onHand - item.quantity
      
      mongoVariant.inventories.onHand -= item.quantity;
      mongoVariant.inventories.trading -= item.quantity;

      await mongoVariant.save();

      const inventory = new Inventory({
        variantId,
        actionName: 'Xuất kho giao hàng cho khách/shipper',
        change: {
          amount: item.quantity,
          type: 'Giảm'
        },
        instock: mongoVariant.inventories.onHand,
        reference: order.code,
        price: item.price,
      })

      await inventory.save()

      if(mongoVariant.linkedIds.length > 0) {
        await checkLinkedVariants(mongoVariant, req.mongoToken)
      }
    }))

    order.step[2] = {
      name: order.step[2].name,
      isCreated: true,
      createdAt: new Date()
    }

    order.outstockStatus = true

    await order.save()
    await checkComplete(req.params._id)

    res.status(200).send(order)
  } catch(e) {
    console.log(e)
    res.status(500).send(Error({ message: 'Create order receipt went wrong!'}))
  }
}

module.exports.createPackaging = async (req, res) => {
  try { 
    const order = await Order.findOne({ _id: req.params._id })
    
    order.step[1] = {
      name: order.step[1].name,
      isCreated: true,
      createdAt: new Date()
    }

    order.packStatus = true

    await order.save()

    res.status(200).send(order)
  } catch(e) {
    console.log(e.message)
    res.send(500).send(Error({ message: 'Đóng gói đơn hàng thất bại !' }))
  }
}

module.exports.createOrder = async (req,res) => {
  try {
    const step = [
    {
      name: 'Đặt hàng và duyệt',
      isCreated: true,
      createdAt: Date.now()
    },
    {
      name: 'Đóng gói',
      isCreated: false,
    },
    {
      name: 'Xuất kho',
      isCreated: false,
    },
    {
      name: 'Hoàn thành',
      isCreated: false,
    },
    {
      name: 'Đã hoàn trả',
      isCreated: false,
    },
    {
      name: 'Đã hủy',
      isCreated: false,
    },
    ]
    const order = new Order({...req.body, step })

    const { lineItems } = req.body
    
    await Promise.all(lineItems.map(async variant => {
      const matchedVariant = await Variant.findOne({ _id: variant._id })
      matchedVariant.inventories.trading += variant.quantity
      matchedVariant.save()
    }))

    await order.save()
    res.send(order)
  } catch(e) {
    console.log(e.message)
    res.status(500).send(Error({ message: 'Create order went wrong!'}))
  }
}

module.exports.getAllOrder = async (req, res) => {
  try {
    
    const orders = await Order.find({ userId: req.user._id })
    
    res.send(orders)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getOrderById = async function (req, res) {
  try {
    const orderId = req.params.id;
    const order = await Order.find({ _id: orderId })
    res.send(order)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updatePayment = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params._id, userId: req.user._id })

    order.paidPrice += req.body.paidPrice
    order.paidHistory.push({ title: `Xác nhận thanh toán ${req.body.formattedPaidPrice}`, date: Date.now()})
    if(order.paidPrice === order.totalPrice) {
      order.paymentStatus = 'Đã thanh toán'
    } else if(order.paidPrice >= 0 && order.paidPrice <= order.totalPrice) {
      order.paymentStatus = 'Thanh toán một phần'
    }

    await order.save()
    await checkComplete(req.params._id)

    res.status(200).send(order)
  } catch(e) {
    console.log(e.message)
    res.status(400).send(Error({ message: 'update purchase payment went wrong !!!'}))
  }
}

module.exports.cancelOrder = async (req, res) => {
  try {
    const { _id } = req.params

    const order = await Order.findOne({ _id })

    order.orderStatus = 'Đã hủy'

    order.step[5] = {
      name: order.step[5].name,
      isCreated: true,
      createdAt: new Date()
    }

    await order.save()

    res.status(200).send(order)

  } catch(e) {
    res.status(400).send(Error({ message: 'Hủy đơn hàng thất bại!'}))
  }
}
