const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lineItemSchema = new Schema({
  price: {
    type: Number
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
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
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
  note: {
    type: String,
  },
  totalPrice: {
    type: Number,
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
    type: mongoose.Schema.Types.ObjectId,
  },
  orderStatus: {
    type: String,
    default: 'Đang giao dịch'
  },
  outstockStatus: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    default: 'Chưa thanh toán'
  },
  packStatus: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  lineItems: [lineItemSchema],
  step: {
    type: [stepSchema],
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
});

module.exports = mongoose.model("Order", orderSchema);
