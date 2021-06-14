const mongoose = require("mongoose")
const Schema = mongoose.Schema

const lineItemSchema = new Schema({
  price: {
    type: Number
  },
  avatar: {
    type: String
  },
  name: {
    type: String
  },
  sku: {
    type: String
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId
  },
  quantity: {
    type: Number
  },
  lazOrderId: {
    type: String
  }
})

const stepSchema = new Schema({
  name: {
    type: String
  },
  isCreated: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
  },
})

const orderSchema = new Schema({
  code: {
    type: String,
  },
  source: {
    type: String,
    default: 'web'
  },
  store_id: {
    type: String,
  },
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  store_name: {
    type: String,
  },
  pricePolicy: { 
    type: String,
    default: 'retailPrice'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  note: {
    type: String,
    default: ''
  },
  shippingFee:{
    type: Number,
    default: 0,
  },
  shippingVoucher: {
    type: Number,
    default: 0,
  },
  orderVoucher: {
    type: Number,
    default: 0,
  },
  trackingNumber:{
    type: String
  },
  deliveryInfo:{
    type: String,
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  deliveryStatus: {
    type: String,
  },
  totalPrice: {
    type: Number,
  },
  totalAmount: {
    type: Number,
  },
  subTotal: {
    type: Number,
  },
  cancelCode: {
    type: String,
  },
  cancelReason: {
    type: String,
  },
  delayReason: {
    type: String,
  },
  delayDateFrom: {
    type: Date,
  },
  delayDateTo: {
    type: Date,
  },
  paidPrice: {
    type: Number,
    default: 0
  },
  paidHistory: [{
    title: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now()
    }
  }],
  totalQuantity: {
    type: Number,
  },
  reference: {
    name: {
      type: String,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
    }
  },
  orderStatus: {
    type: String,
    default: 'Đang giao dịch'
  },
  paymentStatus: {
    type: String,
    default: 'Chưa thanh toán'
  },
  paymentMethod: {
    type: String,
    default: 'COD'
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  lineItems: [lineItemSchema],
  bill: {
    type: String,
  },
  step: {
    type: [stepSchema],
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
});

const purchaseOrderSchema = orderSchema.clone();
purchaseOrderSchema.add({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId
  },
  supplierName: {
    type: String
  },
  supplierAddress: {
    type: String,
  },
  supplierEmail: {
    type: String,
  },
  supplierPhone: {
    type: String,
  },
  instockStatus: {
    type: Boolean,
    default: false
  },
})
const salesOrderSchema = orderSchema.clone();
salesOrderSchema.add({
  customerId: {
    type: mongoose.Schema.Types.ObjectId
  },
  customerName: {
    type: String
  },
  customerAddress: {
    type: String,
  },
  customerEmail: {
    type: String,
  },
  customerPhone: {
    type: String,
  },
  packStatus: {
    type: Boolean,
    default: false
  },
  outstockStatus: {
    type: Boolean,
    default: false
  },
})

const refundOrderSchema = orderSchema.clone();
refundOrderSchema.add({
  customerId: {
    type: mongoose.Schema.Types.ObjectId
  },
  customerName: {
    type: String
  },
  customerAddress: {
    type: String,
  },
  customerEmail: {
    type: String,
  },
  customerPhone: {
    type: String,
  },
  instockStatus: {
    type: Boolean,
    default: false
  }
})
const supplierRefundOrderSchema = orderSchema.clone();
supplierRefundOrderSchema.add({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId
  },
  supplierName: {
    type: String
  },
  supplierAddress: {
    type: String,
  },
  supplierEmail: {
    type: String,
  },
  supplierPhone: {
    type: String,
  },
  outstockStatus: {
    type: Boolean,
    default: false
  }
})

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema)
const Order = mongoose.model("Order", salesOrderSchema)
const RefundOrder = mongoose.model("RefundOrder", refundOrderSchema)
const SupplierRefundOrder = mongoose.model("SupplierRefundOrder", supplierRefundOrderSchema)

module.exports = { PurchaseOrder, Order, RefundOrder, SupplierRefundOrder }

