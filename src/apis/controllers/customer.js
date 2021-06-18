const Error = require('../utils/error')
const Customer = require('../models/customer')

module.exports.checkCustomerExist = async(req, res) => {
  try {
    const isCustomerExist = await Customer.findOne({ email: req.params.email, userId: req.user._id })
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
    const isCustomerExist = await Customer.findOne({ email: req.body.email, userId: req.user._id })
    if(isCustomerExist) {
      return res.status(409).send(Error({ message: 'Khách hàng đã tồn tại !'}))
    } else {
      const customer = new Customer({ ...req.body, userId: req.user._id })
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
    const customers = await Customer.find({ userId: req.user._id, isDeleted: false })
    res.send(customers)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id, _id: req.params._id })
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
      userId: req.user._id,
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
    if(req.body.email){
      const isCustomerExist = await Customer.findOne({ email: req.body.email, userId: req.user._id, _id: {$ne: req.params._id}})

      if(isCustomerExist) {
        return res.status(409).send(Error({ message: 'Email đã tồn tại ! Không thể trùng!'}))
      }
    }
    const customer = await Customer.findOneAndUpdate({_id: req.params._id},{...req.body},{returnOriginal: false})
    return res.status(200).send(customer)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate({_id: req.params._id},{isDeleted: true},{returnOriginal: false});

    res.status(200).send(customer)

  } catch (e) {
    res.status(500).send(Error(e));
  }
};