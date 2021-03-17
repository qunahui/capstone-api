const Error = require("../utils/error");
const PurchaseOrder = require("../models/purchaseOrder")
const Inventory = require("../models/inventory")
const Product = require("../models/product");

module.exports.createReceipt = async (req,res) => {
  try {
    const { lineItems } = req.body

    const purchaseOrder = await PurchaseOrder.findOne({ _id: req.params._id })
    
    await Promise.all(lineItems.map(async (item) => {
      const variantId = item._id
      const productId = item.productId
      const product = await Product.findOne({ _id: productId }).lean()
      const newVariants = await Promise.all(product.variants.map(async (variant) => {
        variant.options.map(option => {
          return option
        })

        if(variant._id.toString() === variantId) {
          const newStock = variant.inventories.initStock + item.quantity
          const inventory = new Inventory({
            variantId: item._id,
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

          return {
            ...variant,
            inventories: {
              ...variant.inventories,
              initStock: newStock,
            }
          }
        }
        return variant
      }))

      product.variants = newVariants;
      product.options.map(option => {
        return option
      })

      await Product.findOneAndUpdate({ _id: productId }, product, {})
    }))

    purchaseOrder.step[1] = {
      name: purchaseOrder.step[1].name,
      isCreated: true,
      createdAt: new Date()
    }

    purchaseOrder.instockStatus = true

    await purchaseOrder.save()

    res.status(200).send(purchaseOrder)
  } catch(e) {
    console.log(e)
    res.status(500).send(Error({ message: 'Create purchase order went wrong!'}))
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

    res.status(200).send(purchaseOrder)
  } catch(e) {
    console.log(e.message)
    res.status(400).send(Error({ message: 'update purchase payment went wrong !!!'}))
  }
}

