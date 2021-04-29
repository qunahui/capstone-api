const Error = require("../utils/error");
const { RefundOrder, Order } = require("../models/order")
const Inventory = require("../models/inventory")
const Variant = require("../models/variant")

const checkComplete = async (_id) => {
  try {
    const refundOrder = await RefundOrder.findOne({ _id })
    const { paymentStatus, instockStatus } = refundOrder
    if(paymentStatus === 'Đã thanh toán' && instockStatus === true) {
      refundOrder.step[2] = {
        name: refundOrder.step[2].name,
        isCreated: true,
        createdAt: new Date()
      }
      refundOrder.orderStatus = 'Hoàn thành'
  
      await refundOrder.save()
    } 
  } catch(e) {
    console.log(e.message)
  }
}

module.exports.checkComplete = checkComplete

module.exports.createReceipt = async (req,res) => {
  try {
    const { lineItems } = req.body

    const refundOrder = await RefundOrder.findOne({ _id: req.params._id })
    
    if(!refundOrder.instockStatus) {
      await Promise.all(lineItems.map(async (item) => {
        const variantId = item._id
        const mongoVariant = await Variant.findOne({ _id : variantId })
  
        const newStock = mongoVariant.inventories.onHand + item.quantity
  
        mongoVariant.inventories.onHand = newStock;
        mongoVariant.inventories.incoming -= item.quantity;

        await mongoVariant.save();
  
        const inventory = new Inventory({
          variantId,
          actionName: 'Khách hoàn trả',
          change: {
            amount: item.quantity,
            type: 'Tăng'
          },
          instock: newStock,
          reference: refundOrder.code,
          price: item.price,
        })
  
        await inventory.save()
        
        const matchedSalesOrder = await Order.findOne({ _id: refundOrder.reference.id })
        matchedSalesOrder.step[4] = {
          name: matchedSalesOrder.step[4].name,
          isCreated: true,
          createdAt: new Date()
        }

        matchedSalesOrder.orderStatus = 'Đã hoàn trả'

        await matchedSalesOrder.save()
      }))
  
      refundOrder.step[1] = {
        name: refundOrder.step[1].name,
        isCreated: true,
        createdAt: new Date()
      }
  
      refundOrder.instockStatus = true
  
      await refundOrder.save()
      await checkComplete(req.params._id)
  
      return res.status(200).send(refundOrder)
    } else {
      return res.status(400).send(Error({ message: 'Đơn đã được xử lý trước đó !'}))
    }
  } catch(e) {
    console.log("create receipt error: ", e.message)
    return res.status(500).send(Error({ message: 'Create refund order went wrong!'}))
  }
}

module.exports.createRefundOrder = async (req,res) => {
  try {
    const step = [
    {
      name: 'Duyệt đơn hoàn',
      isCreated: true,
      createdAt: Date.now()
    },
    {
      name: 'Nhập kho',
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
    ]

    const { lineItems } = req.body

    await Promise.all(lineItems.map(async variant => {
       const matchedVariant = await Variant.findOne({ _id: variant._id })
       matchedVariant.inventories.incoming += variant.quantity
       matchedVariant.save()
    }))

    const refundOrder = new RefundOrder({
      ...req.body, 
      step,
    })

    await refundOrder.save()

    res.send(refundOrder)
  } catch(e) {
    console.log(e)
    res.status(500).send(Error({ message: 'Create refund order went wrong!'}))
  }
}

module.exports.getAllRefundOrder = async (req, res) => {
  try {
    const refundOrders = await RefundOrder.find({ userId: req.user._id })
    
    console.log(refundOrders)
    res.send(refundOrders)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getRefundOrderById = async function (req, res) {
  try {
    const refundOrderId = req.params.id;
    const refundOrder = await RefundOrder.find({ _id: refundOrderId })
    res.send(refundOrder)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateRefundPayment = async (req, res) => {
  try {
    const refundOrder = await RefundOrder.findOne({ _id: req.params._id, userId: req.user._id })

    if(refundOrder.paidPrice !== refundOrder.totalPrice) {
      refundOrder.paidPrice += req.body.paidPrice
      refundOrder.paidHistory.push({ title: `Xác nhận thanh toán ${req.body.formattedPaidPrice}`, date: Date.now()})
      if(refundOrder.paidPrice === refundOrder.totalPrice) {
        refundOrder.paymentStatus = 'Đã thanh toán'
      } else if(refundOrder.paidPrice >= 0 && refundOrder.paidPrice <= refundOrder.totalPrice) {
        refundOrder.paymentStatus = 'Thanh toán một phần'
      }

      await refundOrder.save()
      await checkComplete(req.params._id)

      res.status(200).send(refundOrder)
    } else {
      return res.status(400).send(Error({ message: 'Đơn đã được xử lý trước đó !'}))
    }
  } catch(e) {
    console.log(e.message)
    res.status(400).send(Error({ message: 'update refund payment went wrong !!!'}))
  }
}


module.exports.cancelRefundOrder = async (req, res) => {
  try {
    const { _id } = req.params

    const refundOrder = await RefundOrder.findOne({ _id })
    
    if(refundOrder.orderStatus !== 'Đã hủy') {
      refundOrder.orderStatus = 'Đã hủy'
    
      refundOrder.step[3] = {
        name: refundOrder.step[3].name,
        isCreated: true,
        createdAt: new Date()
      }

      await refundOrder.save()

      res.status(200).send(refundOrder)
    } else {
      res.status(400).send(Error({ message: 'Đơn này đã được xử lý trước đó !'}))
    }

  } catch(e) {
    res.status(400).send(Error({ message: 'Hủy đơn hàng thất bại!'}))
  }
}

