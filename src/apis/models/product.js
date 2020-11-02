const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema(
  {
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
  },
  { timestamps: true }
);

schema.virtual("productDetails", {
  ref: "productDetail",
  localField: "_id",
  foreignField: "productID",
});

module.exports = mongoose.model("product", schema);
