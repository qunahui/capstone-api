const Error = require('../utils/error')
const Inventory = require('../models/inventory')

module.exports.createInventory = async (req, res) => {
  try {
    const inventory = new Inventory({ ...req.body}) 

    await inventory.save()

    res.status(201).send(inventory)
  } catch(e) {
    res.status(400).send(Error({ message: 'Tạo kho thất bại !'}))
  }
}

module.exports.getAllInventoriesByVariantId = async (req, res) => {
  try {
    const { id } = req.params
    
    const inventories = await Inventory.find({ variantId: id })

    res.status(200).send(inventories)
  } catch(e) {
    res.status(400).send(Error({ message: 'Lấy thông tin tồn kho thất bại !'}))
  }
}