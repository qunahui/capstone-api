const Error = require('../utils/error')
const Supplier = require('../models/supplier')

module.exports.createSupplier = async (req, res) => {
  try { 
    const supplier = new Supplier({ ...req.body, userId: req.user._id }) 
    
    console.log("Created: ", supplier)

    supplier.save()

    res.status(200).send(supplier)
  } catch(e) {
    let status = 400;
    let error = e;

    console.log("error: ", e)

    if (e.name === "MongoError" && e.code === 11000) {
      status = 409;
      error = {
        message: "Nhà cung cấp đã tồn tại trong danh sách của bạn!",
      };
    }

    res.status(status).send(Error(error));
  }
};

module.exports.getAllSupplier = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user._id })
    console.log("Found: ", suppliers)
    res.send(suppliers)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id, _id: req.params._id })
    console.log("Found: ", supplier)
    res.send(supplier)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};