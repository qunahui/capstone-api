const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  searchName: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  details: {
    type: String,
    required: true,
  },

  averageRating: {
    type: Number,
    default: -1,
  },
  categoryID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "productCategory",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  productDetail: [
    {
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "product",
      },
      size: {
        type: String,
        require: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 0,
      },
      price: {
        type: Number,
        required: true,
      },
      photoURL: {
        type: String,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("product_productDetail", schema);
