const Error = require('../utils/error')
const Customer = require('../models/customer')

module.exports.checkCustomerExist = async(req, res) => {
  try {
    const isCustomerExist = await Customer.findOne({ email: req.params.email, storageId: req.user.currentStorage.storageId })
    if(isCustomerExist) {
      res.status(409).send(Error({ message: 'Khách hàng đã tồn tại !'}))
    } else {
      res.status(200).send({message: "Khách hàng có thể được tạo !"})
    }
  } catch(e) {
    res.status(400).send(Error({message: "Có gì đó sai sai!"}))
  }
}

module.exports.createCustomer = async (req, res) => {
  try { 
    const isCustomerExist = await Customer.findOne({ email: req.body.email, storageId: req.user.currentStorage.storageId })
    if(isCustomerExist) {
      return res.status(409).send(Error({ message: 'Khách hàng đã tồn tại !'}))
    } else {
      const customer = new Customer({ ...req.body, storageId: req.user.currentStorage.storageId })
      await customer.save()
      return res.status(200).send(customer)
    }
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

module.exports.getAllCustomer = async (req, res) => {
  try {
    const customers = await Customer.find({ storageId: req.user.currentStorage.storageId, isDeleted: false })
    res.status(200).send(customers)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ storageId: req.user.currentStorage.storageId, _id: req.params._id })
    if(!customer){
      return res.sendStatus(404)
    }
    console.log("Found: ", customer)
    res.status(200).send(customer)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.searchCustomer = async (req, res) => {
  try {
    const {name, group, email, phone, isDeleted} = req.query
    const customer = await Customer.find({
      storageId: req.user.currentStorage.storageId,
      $or:[
        {phone: {$regex: `${phone}`,  $options : 'i'}},
        {name: {$regex: `${name}`,  $options : 'i'}},
        {group: {$regex: `${group}`,  $options : 'i'}},
        {email: {$regex: `${email}`,  $options : 'i'}},
        {isDeleted: isDeleted}
      ]
      
    })
    res.status(200).send(customer)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateCustomer = async (req, res) => {
  const updateField = req.body;
  console.log(updateField)
  try {
    if(updateField.email){
      const isCustomerExist = await Customer.findOne({ email: updateField.email, storageId: req.user.currentStorage.storageId, _id: {$ne: req.params._id}})

      if(isCustomerExist) {
        return res.status(409).send(Error({ message: 'Email đã tồn tại ! Không thể trùng!'}))
      }
    }
    const customer = await Customer.findOneAndUpdate({_id: req.params._id},{...updateField},{returnOriginal: false})
    return res.status(200).send(customer)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate({_id: req.params._id},{isDeleted: true},{returnOriginal: false});
    if(!customer){
      return res.sendStatus(404)
    }
    res.status(200).send(customer)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};