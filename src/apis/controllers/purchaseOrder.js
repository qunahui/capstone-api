const Error = require("../utils/error");
const { PurchaseOrder } = require("../models/order")
const Inventory = require("../models/inventory")
const Variant = require("../models/variant")
const rp = require("request-promise")

const checkComplete = async (_id) => {
  try {
    const purchaseOrder = await PurchaseOrder.findOne({ _id })
    const { paymentStatus, instockStatus } = purchaseOrder
    if(paymentStatus === 'Đã thanh toán' && instockStatus === true) {
      purchaseOrder.step[2] = {
        name: purchaseOrder.step[2].name,
        isCreated: true,
        createdAt: new Date()
      }
      purchaseOrder.orderStatus = 'Hoàn thành'
  
      await purchaseOrder.save()
    } 
  } catch(e) {
    console.log(e.message)
  }
}

module.exports.checkComplete = checkComplete

module.exports.createReceipt = async (req,res) => {
  try {
    const { lineItems } = req.body

    const purchaseOrder = await PurchaseOrder.findOne({ _id: req.params._id })
    
    await Promise.all(lineItems.map(async (item) => {
      const variantId = item._id
      const mongoVariant = await Variant.findOne({ _id : variantId })

      const newStock = mongoVariant.inventories.initStock + item.quantity

      mongoVariant.inventories.initStock = newStock;
      await mongoVariant.save();

      const inventory = new Inventory({
        variantId,
        actionName: 'Nhập hàng vào kho',
        change: {
          amount: item.quantity,
          type: 'Tăng'
        },
        instock: newStock,
        reference: purchaseOrder.code,
        price: item.price,
      })

      await inventory.save()
      
    }))

    purchaseOrder.step[1] = {
      name: purchaseOrder.step[1].name,
      isCreated: true,
      createdAt: new Date()
    }

    purchaseOrder.instockStatus = true

    await purchaseOrder.save()
    await checkComplete(req.params._id)

    return res.status(200).send(purchaseOrder)
  } catch(e) {
    console.log("create receipt error: ", e.message)
    return res.status(500).send(Error({ message: 'Create purchase order went wrong!'}))
  }
}

module.exports.createInitialPurchaseOrder = async (req,res) => {
  try {
    const step = [
    {
      name: 'Đặt hàng và duyệt',
      isCreated: true,
      createdAt: Date.now()
    },
    {
      name: 'Nhập kho',
      isCreated: true,
      createdAt: Date.now()
    },
    {
      name: 'Hoàn thành',
      isCreated: true,
      createdAt: Date.now()
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

    const purchaseOrder = new PurchaseOrder({
      ...req.body, 
      step,
    })

    await purchaseOrder.save()
    
    await rp({
      method: 'POST',
      url: 'http://localhost:5000/purchase-orders/receipt/' + purchaseOrder._id,
      json: true,
      body: {
        ...req.body
      },
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken
      }
    })

    res.send(purchaseOrder)
  } catch(e) {
    console.log(e)
    res.status(500).send(Error('Create purchase order went wrong!'))
  }
}

module.exports.createPurchaseOrder = async (req,res) => {
  try {
    const step = [
    {
      name: 'Đặt hàng và duyệt',
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
      name: 'Đã hoàn trả',
      isCreated: false,
    },
    {
      name: 'Đã hủy',
      isCreated: false,
    },
    ]

    const purchaseOrder = new PurchaseOrder({...req.body, step })
    await purchaseOrder.save()
    res.send(purchaseOrder)
  } catch(e) {
    res.status(500).send(Error('Create purchase order went wrong!'))
  }
}

module.exports.getAllPurchaseOrder = async (req, res) => {
  try {
    
    const purchaseOrders = await PurchaseOrder.find({ userId: req.user._id })
    
    res.send(purchaseOrders)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getPurchaseOrderById = async function (req, res) {
  try {
    const purchaseOrderId = req.params.id;
    const purchaseOrder = await PurchaseOrder.find({ _id: purchaseOrderId })
    res.send(purchaseOrder)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updatePurchasePayment = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findOne({ _id: req.params._id, userId: req.user._id })

    purchaseOrder.paidPrice += req.body.paidPrice
    purchaseOrder.paidHistory.push({ title: `Xác nhận thanh toán ${req.body.formattedPaidPrice}`, date: Date.now()})
    if(purchaseOrder.paidPrice === purchaseOrder.totalPrice) {
      purchaseOrder.paymentStatus = 'Đã thanh toán'
    } else if(purchaseOrder.paidPrice >= 0 && purchaseOrder.paidPrice <= purchaseOrder.totalPrice) {
      purchaseOrder.paymentStatus = 'Thanh toán một phần'
    }

    await purchaseOrder.save()
    await checkComplete(req.params._id)

    res.status(200).send(purchaseOrder)
  } catch(e) {
    console.log(e.message)
    res.status(400).send(Error({ message: 'update purchase payment went wrong !!!'}))
  }
}


module.exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const { _id } = req.params

    const purchaseOrder = await PurchaseOrder.findOne({ _id })
    
    purchaseOrder.orderStatus = 'Đã hủy'
    
    purchaseOrder.step[4] = {
      name: purchaseOrder.step[4].name,
      isCreated: true,
      createdAt: new Date()
    }

    
    await purchaseOrder.save()

    res.status(200).send(purchaseOrder)

  } catch(e) {
    res.status(400).send(Error({ message: 'Hủy đơn hàng thất bại!'}))
  }
}

