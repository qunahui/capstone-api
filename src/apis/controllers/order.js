const Error = require("../utils/error");
const { Order, RefundOrder } = require("../models/order")
const Storage = require('../models/storage')
const Inventory = require("../models/inventory")
const Variant = require("../models/variant")
const rp = require('request-promise')
const timeDiff = require('../utils/timeDiff')


const payment_method ={
  "1": "COD",
  "2": "Senpay",
  "4": "Compine",
  "5": "PayLater"
}
const payment_status = {
  "1": "Chưa thanh toán",
  "2": "CODCarrier",
  "3": "Đã thanh toán",
  "4": "Đã hoàn thành",
  "5": "Hoàn trả",
  "6": "Đang chờ",
  "7": "Từ chối",
  "14": "Thanh toán một phần",
  "15": "Hoàn trả một phần"
}
const order_status = {
  "2": "Đặt hàng",
  "3": "Đang xử lý",
  "6": "Đang giao hàng",
  "7": "POD",
  "8": "Đã hoàn thành",
  "10": "Đã đóng",
  "11": "Delaying",
  "12": "Delay",
  "13": "Đã hủy",
  "14": "Splitting",
  "15": "Splitted",
  "19": "Merging",
  "21": "Returning",
  "22": "Returned",
  "23": "WaitingSendo",
}
const sendo_cancel_reason = {
  "CBS1": "Hết hàng",
  "CBS100": "Người bán tự vận chuyển",
  "CBS101": "Không liên lạc được với người mua",
  "CBS102": "Người mua đặt nhầm, trùng sản phẩm",
  "CBS103": "Người mua không đồng ý hoãn thời gian giao hàng",
  "CBS104": "Người bán đăng sai giá sản phẩm ",
  "CBS105": "Người bán thay đổi thông tin kho hàng",
  "CBS106": "Người nhận không phải người đặt hàng",
  "CBS107": "Người mua không muốn mua nữa",
  "CBS108": "Người mua thay đổi chi tiết đơn hàng (màu sắc, kích thước, số lượng...)",
  "CBS109": "Người mua nhập địa chỉ không rõ ràng, số điện thoại không chính xác",
  "CBS110": "Người bán giao hàng gấp theo yêu cầu của người mua",
  "CBS111": "Nhà vận chuyển không tiếp nhận đơn hàng/không đến lấy hàng"
}
const sendo_delivery_status = { 
  '9': "Chưa tạo vận đơn",
  '1': "Mới",
  '2': "Đang xử lý",
  '3': "Đang lấy hàng",
  '4': "Đang xếp hàng",
  '5': "Đang giao hàng",
  '6': "Đã giao hàng",
  '8': "Trả hàng cho người bán",
  '10': "Người bán đã nhận lại hàng",
  '11': "Đã đổi hàng",
  '12': "Đang trả hàng",
  '13': "Đổi trả thành công",
  '14': "Lấy hàng thành công",
  '15': "Bàn giao thành công LM",
  '16': "Mất hàng",
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
    name: 'Xuất kho/Đang giao hàng',
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
    name: 'Đã hủy',
    isCreated: false,
  },
  {
    name: 'Đang hoàn trả',
    isCreated: false,
  },
  {
    name: 'Đã hoàn trả',
    isCreated: false,
  },
]

const checkComplete = async (_id) => {
  try {
    const order = await Order.findOne({ _id })
    const { paymentStatus, deliveryStatus } = order
    if(paymentStatus === 'Đã thanh toán' && deliveryStatus === 'Đã giao hàng') {
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

    const index = order.step.findIndex(i => i.name === 'Xuất kho/Đang giao hàng')
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

    order.deliveryStatus = 'Đã giao hàng'

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
      name: 'Xuất kho/Đang giao hàng',
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
      name: 'Đã hủy',
      isCreated: false,
    },
    {
      name: 'Đang hoàn trả',
      isCreated: false,
    },
    {
      name: 'Đã hoàn trả',
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
  const { item, cred } = req.body;
  const listItem = await rp({
    method: 'GET',
    url:"http://localhost:5000/api/lazada/orders/items/"+ item.order_number,
    headers: {
      'Authorization': 'Bearer ' + req.mongoToken,
      'Platform-Token': req.accessToken
    },
    json: true
  })

  const orderInformation = {
    source: "lazada",
    store_id: cred.store_id,
    store_name: cred.store_name,
    orderStatus: item.statuses[0],
    code: item.order_number,
    subTotal: item.price,
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
  }

  const order = await Order.findOneAndUpdate({ code: item.order_number }, orderInformation, { upsert: true, timestamps: false, runValidators: true })
  
  try {
    res.send(order);
  } catch (e) {
    res.status(500).send(Error(e));
  }
}
module.exports.createSendoOrder = async (req,res) => {
  const { item, cred } = req.body;

  const created_at = new Date(item.sales_order.created_date_time_stamp*1000).setHours(new Date(item.sales_order.created_date_time_stamp*1000).getHours() - 7)
  const updated_at = new Date(item.sales_order.updated_date_time_stamp*1000).setHours(new Date(item.sales_order.updated_date_time_stamp*1000).getHours() - 7)

  item.sku_details.forEach(e => {
    e.name = e.product_name
  });

  const mappingStep = { 2: { index: 0, name: 'Đặt hàng' }, 3: { index: 1, name: 'Duyệt'}, 4: { index: 2, name: 'Đóng gói'} , 6: { index: 3, name: 'Xuất kho/Đang giao hàng'}, 7: { index: 4, name: 'Đã giao hàng'}, 8: { index: 5, name: 'Hoàn thành'}, 10: { index: 6, name: 'Hoàn thành'}, 13: { index: 7, name: 'Đã hủy'}, 21: { index: 8, name: 'Đang hoàn trả'}, 22: { index: 9, name: 'Đã hoàn trả'} }
  const completeStep = item.sales_order.order_status
  let configStep = step.map((st, index) => {
    if(index <= mappingStep[completeStep].index) { 
      return {
        name: st.name,
        createdAt: index === 0 ? created_at : index === mappingStep[completeStep].index ? updated_at : null,
        isCreated: true
      }
    } else {
      return st
    }
  })
  try {
    const orderInformation = {
      source: "sendo",
      store_id: cred.store_id,
      store_name: cred.store_name,
      code: item.sales_order.order_number,
      orderStatus: order_status[`${item.sales_order.order_status}`],
      packStatus: item.sales_order.order_status >= 3,
      //order infomation
      paymentMethod: payment_method[`${item.sales_order.payment_method}`],
      discount: item.sales_order.voucher_value,
      paymentStatus: payment_status[`${item.sales_order.payment_status}`],
      note: item.sales_order.note,
      //shipping infomation
      deliveryInfo: item.sales_order.carrier_name,
      deliveryStatus: sendo_delivery_status[item.sales_order.delivery_status],
      trackingNumber: item.sales_order.tracking_number,
      shippingFee: item.sales_order.shipping_fee,
      //customer overview
      customerName: item.sales_order.receiver_name,
      customerEmail: item.sales_order.receiver_email,
      customerPhone: item.sales_order.shipping_contact_phone,
      customerAddress: item.sales_order.ship_to_address,
      //+", "+region.result.name,
      userId: req.user._id,
      subTotal: item.sales_order.sub_total,
      totalPrice: item.sales_order.total_amount_buyer,
      totalAmount: item.sales_order.total_amount,
      totalQuantity: item.sku_details.reduce((acc, i) => acc += i.quantity, 0),
      shippingVoucher: item.sales_order.shipping_voucher_amount,
      platformFee: item.sales_order.shop_program_amount || 0,
      //list item
      lineItems: item.sku_details, 
      createdAt: created_at,
      updatedAt: updated_at,
      //cancel-delay
      cancelReason: item.sales_order.reason_cancel,
      cancelCode: item.sales_order.reason_cancel_code,
      delayReason: item.sales_order.reason_delay,
      delayDateFrom: item.sales_order.delay_date_time_stamp,
      delayDateTo: item.sales_order.delay_to_date_time_stamp,
      step: configStep
    }

    const order = await Order.findOneAndUpdate({ code: item.sales_order.order_number }, orderInformation, { upsert: true, timestamps: false, runValidators: true })

    res.send(order);

    //create refund 
    const { delivery_status } = item.sales_order
    if(delivery_status === 8 || delivery_status === 10) {
      const matchedRefundOrder = await RefundOrder.findOne({
        code: item.sales_order.order_number,
      })
      
      if(!matchedRefundOrder) {
        await RefundOrder.findOneAndUpdate({ code: item.sales_order.order_number }, {
          ...orderInformation,
          step: [
            {
              name: 'Duyệt đơn hoàn',
              isCreated: true,
              createdAt: updated_at
            },
            {
              name: 'Nhập kho',
              isCreated: delivery_status === 10 ? true : false,
              createdAt: delivery_status === 10 ? updated_at : null,
            },
            {
              name: 'Hoàn thành',
              isCreated: delivery_status === 10 ? true : false,
              createdAt: delivery_status === 10 ? updated_at : null,
            },
          ],
          orderStatus: delivery_status === 10 ? 'Đã hoàn trả' : 'Đang hoàn trả',
          packStatus: true,
          instockStatus: delivery_status === 10
        }, { upsert: true, timestamps: false, runValidators: true })
      }
    }    
  } catch (e) {
    console.log(e.message)
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
        let now = new Date()
        const response = await rp({
          // url: `${process.env.API_URL}/api/lazada/orders?lastSync=${new Date(cred.lastSync).getTime()}`,
          url: `${process.env.API_URL}/api/lazada/orders`,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            'Platform-Token': cred.access_token
          }
        })
  
        const lazOrders = JSON.parse(response).data.orders || []

        console.log("lax order: ", lazOrders)

        await Promise.all(lazOrders.map(async order => {
          const mongoMatchedOrder = await Order.findOne({ code: order.order_number.toString() })
          // console.log(new Date(order.updated_at).toLocaleString())
          // console.log(new Date(order.created_at).toLocaleString())
          
          if(mongoMatchedOrder) {
            const secondDiff = timeDiff(new Date(mongoMatchedOrder.updatedAt), new Date(new Date(order.created_at))).secondsDifference
            if(secondDiff === 0) {
              // console.log("Do nothing")
              return order;
            }
            
          }

          try {
            await rp({
              method: 'POST',
              url:"http://localhost:5000/orders/lazada",
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
                'Platform-Token': cred.access_token
              },
              json: true,
              body: {
                item: order,
                cred
              }
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
            "order_date_from": cred.lastSync ? new Date(cred.lastSync).toISOString().split('T')[0] : new Date(now.setDate(now.getDate() - 14)).toISOString().split('T')[0],
            "order_date_to": new Date().toISOString().split('T')[0],
            "order_status_date_from": null,
            "order_status_date_to": null,
            "token": null
          }
        })
  
        const senOrders = response.result.data
        
        await Promise.all(senOrders.map(async order => {
          const opt = {
            method: 'GET',
            url: `${process.env.API_URL}/api/sendo/orders/${order.sales_order.order_number}`,
            headers: {
              'Authorization': 'Bearer ' + req.mongoToken,
              'Platform-Token': cred.access_token
            }
          }
          const fullDetailOrderResponse = await rp(opt)
          const fullDetailOrder = JSON.parse(fullDetailOrderResponse).result

          // console.log(fullDetailOrder)

          const mongoMatchedOrder = await Order.findOne({ code: fullDetailOrder.sales_order.order_number })
          
          if(mongoMatchedOrder) {
            // console.log("Sendo: ", new Date(fullDetailOrder.sales_order.updated_date_time_stamp * 1000).toLocaleString())
            // console.log("Mongo: ", new Date(mongoMatchedOrder.updatedAt).toLocaleString())
            const secondDiff = timeDiff(new Date(mongoMatchedOrder.updatedAt), new Date(new Date(fullDetailOrder.sales_order.updated_date_time_stamp*1000).setHours(new Date(fullDetailOrder.sales_order.updated_date_time_stamp*1000).getHours() - 7))).secondsDifference
            // console.log("Second diff", secondDiff)
            if(secondDiff === 0) {
              // console.log("Do nothing")
              return order;
            }
            
          }

          // console.log("Create new order")

          await rp({
            method: 'POST',
            url: `${process.env.API_URL}/orders/sendo`,
            body: {
              item: fullDetailOrder,
              cred
            },
            json: true,
            headers: {
              'Authorization': req.mongoToken
            }
          })
        }))
  
        // matchedStorage.sendoCredentials[index].lastSync = new Date().getTime()
      }
    }))

    matchedStorage.save()

    res.send("ok")
  } catch(e) {
    console.log("Fetch failed: ", e.message)
    res.status(500).send(Error({ message: 'Có gì đó sai sai: , ' + e.message }))
  }

}

module.exports.printBill = async (req, res) => {
  const order = req.body
  const mongoOrder = await Order.findOne({ _id: order._id })
  if(mongoOrder.bill) { 
    const htmlContent = await rp.get(mongoOrder.bill)
    return res.send({ bill: htmlContent })
  }

  const currentStorage = await Storage.findOne({ _id: req.user.currentStorage.storageId })
  try { 
    if(order.source === 'sendo') {
      const response = await rp({
        method: 'GET',
        url: `${process.env.API_URL}/api/sendo/print-bill/${order.code}`,
        headers: {
          'Authorization': 'Bearer ' + req.mongoToken, 
          'Platform-Token': currentStorage.sendoCredentials.find(i => i.store_id === order.store_id).access_token
        },
      })

      await Order.findByIdAndUpdate(order._id, {
        bill: response
      })

      const htmlContent = await rp.get(response)

      return res.status(200).send({ bill: htmlContent })
    } else if(order.source === 'lazada') {}
  } catch(e) {
    console.log("print bill failed: ", e.message)
    res.status(500).send(Error({ message: "Có gì đó sai sai !"}))
  }
}

module.exports.createSendoRefundOrder = async (req, res) => {

}