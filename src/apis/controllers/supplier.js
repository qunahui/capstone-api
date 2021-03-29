const Error = require('../utils/error')
const Supplier = require('../models/supplier')

module.exports.createSupplier = async (req, res) => {
  try { 
    const isSupplierExist = await Supplier.findOne({ email: req.body.email, userId: req.user._id })
    if(isSupplierExist) {
      res.status(409).send(Error({ message: 'Nhà cung cấp đã tồn tại !'}))
    } else {
      const supplier = new Supplier({ ...req.body, userId: req.user._id }) 
      supplier.save()
      console.log("Created: ", supplier)
      res.status(200).send(supplier)
    }
  } catch(e) {
    let status = 400;
    let error = e;

    console.log("error name: ", e.name)
    console.log("error code: ", e.code)

    if (e.name === "MongoError" && e.code === 11000) {
      status = 409;
      error = {
        message: "Nhà cung cấp đã tồn tại trong danh sách của bạn!",
      };
    }

    res.status(status).send(Error(error));
  }
};

module.exports.checkSupplierExist = async(req, res) => {
  try {
    const isSupplierExist = await Supplier.findOne({ email: req.params.email, userId: req.user._id })
    if(isSupplierExist) {
      res.status(409).send(Error({ message: 'Nhà cung cấp đã tồn tại !'}))
    } else {
      res.status(200).send({message: "Nhà cung cấp có thể được tạo !"})
    }
  } catch(e) {
    res.status(400).send(Error({message: "Có gì đó sai sai!"}))
  }
}

module.exports.getAllSupplier = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user._id })
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