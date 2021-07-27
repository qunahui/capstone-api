const Error = require('../utils/error')
const Supplier = require('../models/supplier')

module.exports.getAllSupplierGroup = async (req, res) => {
  try {
    const groups = await Supplier.find({ storageId: req.user.currentStorage.storageId, isDeleted: false}).distinct('group')
    res.status(200).send(groups)
  } catch (e) {
    res.status(500).send(Error(e));
  }
}

module.exports.createSupplier = async (req, res) => {
  try { 
    const isSupplierExist = await Supplier.findOne({ email: req.body.email, storageId: req.user.currentStorage.storageId })
    if(isSupplierExist) {
      return res.status(409).send(Error({ message: 'Nhà cung cấp đã tồn tại !'}))
    } else {
      const supplier = new Supplier({ ...req.body, storageId: req.user.currentStorage.storageId }) 
      supplier.save()
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
    const isSupplierExist = await Supplier.findOne({ email: req.params.email, storageId: req.user.currentStorage.storageId })
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
    const { search } = req.query
    const suppliers = await Supplier.find({
      storageId: req.user.currentStorage.storageId,
      $or:[
        {phone: {$regex: `${search}`,  $options : 'i'}},
        {name: {$regex: `${search}`,  $options : 'i'}},
        {group: {$regex: `${search}`,  $options : 'i'}},
        {email: {$regex: `${search}`,  $options : 'i'}},
      ]
    })
    res.status(200).send(suppliers)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ storageID: req.user.currentStorage.storageId, _id: req.params._id })
    if(!supplier){
      return res.sendStatus(404)
    }
    console.log("Found: ", supplier)
    res.status(200).send(supplier)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.searchSupplier = async (req, res) => {
  try {
    const {name, group, email, phone, isDeleted} = req.query
    const supplier = await Supplier.find({
      storageId: req.user.currentStorage.storageId,
      $or:[
        {phone: {$regex: `${phone}`,  $options : 'i'}},
        {name: {$regex: `${name}`,  $options : 'i'}},
        {group: {$regex: `${group}`,  $options : 'i'}},
        {email: {$regex: `${email}`,  $options : 'i'}},
        {isDeleted: isDeleted}
      ]
      
    })
    res.status(200).send(supplier)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateSupplier = async (req, res) => {
  const updateField = req.body;
  try {
    if(req.body.email){
      const isSupplierExist = await Supplier.findOne({ email: req.body.email, storageId: req.user.currentStorage.storageId, _id: {$ne: req.params._id}})

      if(isSupplierExist) {
        return res.status(409).send(Error({ message: 'Email đã tồn tại ! Không thể trùng!'}))
      }
    }
    const supplier = await Supplier.findOneAndUpdate({_id: req.params._id},updateField,{returnOriginal: false})
    return res.status(200).send(supplier)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate({_id: req.params._id},{isDeleted: true},{returnOriginal: false});
    if(!supplier){
      return res.sendStatus(404)
    }
    res.status(200).send(supplier)

  } catch (e) {
    res.status(500).send(Error(e));
  }
};