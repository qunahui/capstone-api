const { Decimal128, Timestamp, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

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

const purchaseOrderSchema = new Schema({
  code: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
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
  instockStatus: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    default: 'Chưa thanh toán'
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

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
