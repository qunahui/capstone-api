const Error = require("../utils/error");
const { Order } = require("../models/order")
const Inventory = require("../models/inventory")
const Variant = require("../models/variant")
const Product = require('../models/product')
const rp = require('request-promise')

const payment_method ={
  "1": "COD",
  "2": "Senpay",
  "4": "Compine",
  "5": "PayLater"
}
const payment_status = {
  "1": "NotPaid",
  "2": "CODCarrier",
  "3": "Paid",
  "4": "Completed",
  "5": "Refund",
  "6": "Waiting",
  "7": "Reject",
  "14": "PartialPaid",
  "15": "PartialRefund"
}
const order_status = {
  "2": "New",
  "3": "Proccessing",
  "6": "Shipping",
  "7": "POD",
  "8": "Completed",
  "10": "Closed",
  "11": "Delaying",
  "12": "Delay",
  "13": "Cancelled",
  "14": "Splitting",
  "15": "Splitted",
  "19": "Merging",
  "21": "Returning",
  "22": "Returned",
  "23": "WaitingSendo",
}
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
      url: `${process.env.API_URL}/variants/push-api`,
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

module.exports.createLazadaOrder = async (req,res) => {
  const item = req.body;
  const listItem = await rp({
    method: 'GET',
    url:"http://localhost:5000/api/lazada/orders/items/"+ item.order_number,
    headers: {
      'Authorization': 'Bearer ' + req.mongoToken,
      'Platform-Token': req.accessToken
    },
    json: true
  })

  const order = new Order({
    source: "lazada",
    orderStatus: item.statuses[0],
    code: item.order_number,
    totalPrice: item.price,
    totalQuantity: item.items_count,
    //order infomation
    paymentMethod: item.payment_method,
    note: item.note,
    //shipping infomation
    deliveryInfo: item.delivery_info,
    shippingFee: item.shipping_fee,
    //customer overview
    customerId: item.customerId,
    customerName: item.address_shipping.first_name + item.address_shipping.last_name,
    customerEmail: "",
    customerPhone: item.address_shipping.phone,
    customerAddress: item.address_shipping.address1
    //+", "+address_shipping.address2
    +", "+item.address_shipping.address5
    +", "+item.address_shipping.address4
    +", "+item.address_shipping.address3,

    //list item
    lineItems: listItem,

    createdAt: item.created_at,
    updatedAt: item.updated_at,
    step: step
  })
  try {
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
  }
}
module.exports.createSendoOrder = async (req,res) => {

  const item = req.body;
  const created_at = new Date(item.sales_order.created_date_time_stamp * 1000)
  const updated_at = new Date(item.sales_order.updated_date_time_stamp * 1000)
  // const regionId = item.sales_order.ship_to_region_id
  // var region= await rp({
  //   method: 'GET',
  //   url:`${process.env.API_URL}/api/sendo/region/`+regionId,
  //   headers: {
  //     'Authorization': 'Bearer ' + req.mongoToken,
  //     'Platform-Token': req.accessToken
  //   },
  //   json: true
  // })
  //change field name
  item.sku_details.forEach(e => {
    e.name = e.product_name
  });

  const order = new Order({
    source: "sendo",
    code: item.sales_order.order_number,
    orderStatus: order_status[`${item.sales_order.order_status}`],
    //order infomation
    paymentMethod: payment_method[`${item.sales_order.payment_method}`],
    discount: item.sales_order.voucher_value,
    paymentStatus: payment_status[`${item.sales_order.payment_status}`],
    note: item.sales_order.note,
    //shipping infomation
    deliveryInfo: item.sales_order.carrier_name,
    trackingNumber: item.sales_order.tracking_number,
    shippingFee: item.sales_order.shipping_fee,
    //customer overview
    customerName: item.sales_order.receiver_name,
    customerEmail: item.sales_order.receiver_email,
    customerPhone: item.sales_order.shipping_contact_phone,
    customerAddress: item.sales_order.ship_to_address,
    //+", "+region.result.name,
    
    //list item
    lineItems: item.sku_details, 
    createdAt: created_at,
    updatedAt: updated_at,
    step: step
  })
  try {
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
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
