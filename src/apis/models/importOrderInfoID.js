const { Decimal128, Timestamp, ObjectId, ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const Inventory = require("./inventory")


const importOrderInfoIDSchema = new Schema({
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
});

importOrderInfoIDSchema.pre("validate",async function (next) {
    const instance = this;

    try {
      instance.id = instance._id 
      next();
    } catch(e) {
      console.log(e)
    }
});

importOrderInfoIDSchema.post("save", async function(next) {
  const instance = this;

  try { 
    const linkedInventory = {
      shopID: 'shop',
      currentStock: 1,
      importOrderInfoID: instance.id
    }

    new Inventory(linkedInventory).save()
  } catch(e) {
    console.log("Error:", e)
  }
})

// schema.virtual("productDetails",{
//   ref:"productDetail",
//   localField: "_id",
//   foreignField: "productID"
// })

module.exports = mongoose.model("ImportOrderInfoID", importOrderInfoIDSchema);
