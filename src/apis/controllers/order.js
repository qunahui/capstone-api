const Error = require("../utils/error");
const { Order } = require("../models/order")
const Storage = require('../models/storage')
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
    name: 'Đặt hàng',
    isCreated: true,
    createdAt: Date.now()
  },
  {
    name: 'Duyệt',
    isCreated: false,
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
    name: 'Đã giao hàng',
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
    const { paymentStatus, deliveryStatus } = order
    if(paymentStatus === 'Đã thanh toán' && deliveryStatus === true) {
      const index = order.step.findIndex(i => i.name === 'Hoàn thành')
      order.step[index] = {
        name: order.step[index].name,
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

    const index = order.step.findIndex(i => i.name === 'Xuất kho')
    order.step[index] = {
      name: order.step[index].name,
      isCreated: true,
      createdAt: new Date()
    }

    order.outstockStatus = true

    await order.save()

    res.status(200).send(order)
  } catch(e) {
    console.log(e)
    res.status(500).send(Error({ message: 'Create order receipt went wrong!'}))
  }
}

module.exports.createPackaging = async (req, res) => {
  try { 
    const order = await Order.findOne({ _id: req.params._id })
    const index = order.step.findIndex(i => i.name === 'Đóng gói')
    order.step[index] = {
      name: order.step[index].name,
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

module.exports.confirmOrder = async (req, res) => {
  try { 
    const order = await Order.findOne({ _id: req.params._id })
    const index = order.step.findIndex(i => i.name === 'Duyệt')
    order.step[index] = {
      name: order.step[index].name,
      isCreated: true,
      createdAt: new Date()
    }

    await order.save()

    res.status(200).send(order)
  } catch(e) {
    console.log(e.message)
    res.send(500).send(Error({ message: 'Đóng gói đơn hàng thất bại !' }))
  }
}

module.exports.confirmDelivery = async (req, res) => {
  try { 
    const order = await Order.findOne({ _id: req.params._id })
    const index = order.step.findIndex(i => i.name === 'Đã giao hàng')
    order.step[index] = {
      name: order.step[index].name,
      isCreated: true,
      createdAt: new Date()
    }

    order.deliveryStatus = true

    await order.save()
    await checkComplete(req.params._id)

    res.status(200).send(order)
  } catch(e) {
    console.log(e.message)
    res.send(500).send(Error({ message: 'Đóng gói đơn hàng thất bại !' }))
  }
}

module.exports.createMMSOrder = async (req,res) => {
  try {
    const step = [
    {
      name: 'Đặt hàng',
      isCreated: true,
      createdAt: Date.now()
    },
    {
      name: 'Duyệt',
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
      name: 'Đã giao hàng',
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

    const { storageId, storageName } = req.user.currentStorage 
    const order = new Order({
      ...req.body, 
      step,
      store_id: storageId,
      store_name: storageName
    })

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

  console.log(listItem)

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
  const { item, cred } = req.body;

  console.log("item: ", item)

  const created_at = new Date(item.sales_order.created_date_time_stamp * 1000)
  const updated_at = new Date(item.sales_order.updated_date_time_stamp * 1000)

  item.sku_details.forEach(e => {
    e.name = e.product_name
  });

  const mappingStep = { 2: { index: 0, name: 'Đặt hàng' }, 3: { index: 1, name: 'Duyệt'}, 6: { index: 2, name: 'Xuất kho'}, 7: { index: 3, name: 'Đã giao hàng'}, 8: { index: 4, name: 'Hoàn thành'}, 10: { index: 5, name: 'Hoàn thành'}, 13: { index: 7, name: 'Đã hủy'} }
  const completeStep = item.sales_order.order_status
  let configStep = step.map((st, index) => {
    if(index <= mappingStep[completeStep].index && index !== 6) { //6 = hoàn trả
      return {
        name: st.name,
        createdAt: new Date(),
        isCreated: true
      }
    } else {
      return st
    }
  })

  const order = new Order({
    source: "sendo",
    store_id: cred.store_id,
    store_name: cred.store_name,
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
    step: configStep
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
    
    const orders = await Order.find({ userId: req.user._id, source: 'web' })
    
    res.send(orders)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getAllMarketplaceOrder = async (req, res) => {
  try {
    
    const orders = await Order.find({ userId: req.user._id, source: { $ne: 'web' } })
    
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
    } else if(order.paidPrice >= 0 && order.paidPrice < order.totalPrice) {
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

    const index = order.step.findIndex(i => i.name === 'Đã hủy')

    order.step[index] = {
      name: order.step[index].name,
      isCreated: true,
      createdAt: new Date()
    }

    await Promise.all(order.lineItems.map(async lineItem => {
      const variant = await Variant.findOne({ _id: lineItem._id })
      variant.inventories.trading -= lineItem.quantity
      await variant.save()
    }))

    await order.save()

    res.status(200).send(order)

  } catch(e) {
    res.status(400).send(Error({ message: 'Hủy đơn hàng thất bại!'}))
  }
}

module.exports.fetchApiOrders = async (req, res) => {
  const { storageId } = req.user.currentStorage

  const matchedStorage = await Storage.findOne({ _id: storageId })

  let allCreds = [].concat(matchedStorage.sendoCredentials).concat(matchedStorage.lazadaCredentials)

  try { 
    await Promise.all(allCreds.map(async (cred, index) => {
      if(cred.platform_name === 'lazada') {
        const response = await rp({
          url: `${process.env.API_URL}/api/lazada/orders?lastSync=${new Date(cred.lastSync).getTime()}`,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            'Platform-Token': cred.access_token
          }
        })
  
        const lazOrders = JSON.parse(response).data.orders || []
  
        await Promise.all(lazOrders.map(async order => {
          try {
            await rp({
              method: 'POST',
              url:"http://localhost:5000/orders/lazada",
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
                'Platform-Token': cred.access_token
              },
              json: true,
              body: order
            })
          } catch(e) {
            console.log(e.message)
          }
        }))
      } else if(cred.platform_name === 'sendo') {
        let now = new Date()
        const response = await rp({
          url: `${process.env.API_URL}/api/sendo/orders`,
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            'Platform-Token': cred.access_token
          },
          json: true,
          body: {
            "page_size": 10,
            // "order_status": 2,
            "order_date_from": cred.lastSync ? new Date(cred.lastSync).toISOString().split('T')[0] : new Date(now.setDate(now.getDate() - 360)).toISOString().split('T')[0],
            "order_date_to": new Date().toISOString().split('T')[0],
            "order_status_date_from": null,
            "order_status_date_to": null,
            "token": null
          }
        })
  
        const senOrders = response.result.data
        
        await Promise.all(senOrders.map(async order => {
          console.log(order)
          const opt = {
            method: 'GET',
            url: `${process.env.API_URL}/api/sendo/orders/${order.sales_order.order_number}`,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': cred.access_token
            }
          }
  
          const fullDetailOrder = await rp(opt)
  
          await rp({
            method: 'POST',
            url: `${process.env.API_URL}/orders/sendo`,
            body: {
              item: JSON.parse(fullDetailOrder).result,
              cred
            },
            json: true,
            headers: {
              'Authorization': req.mongoToken
            }
          })
        }))
  
        matchedStorage.sendoCredentials[index].lastSync = new Date().getTime()
      }
    }))

    matchedStorage.save()

    res.send("ok")
  } catch(e) {
    console.log(e.message)
    res.status(500).send(Error({ message: 'Có gì đó sai sai: , ' + e.message }))
  }

}