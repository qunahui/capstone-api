const { Decimal128, Timestamp, ObjectId, ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const inventorySchema = new Schema({
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    shopID: {
      type: String,
    },
    importOrderInfoID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    currentStock: {
      type: Number,
      required: true
    }
});

inventorySchema.pre("validate",async function (next) {
    const inventory = this;

    try {
      inventory.id = inventory._id 
      next();
    } catch(e) {
      console.log(e)
    }
});

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("Inventory", inventorySchema);
