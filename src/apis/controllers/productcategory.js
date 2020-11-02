const Category = require("../models/productcategory");
const auth = require("../../middlewares/auth");
const Error = require("../utils/error");

module.exports.getAllProductCategories = async function (req, res) {
  try {
    const categories = await Category.find({});
    res.send(categories);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.getProductCategoryById = async function (req, res) {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    await category.populate("products").execPopulate();
    res.send(category);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.editProductCategory = async function (req, res) {
  const category = new Category({
    ...req.body,
  });

  try {
    await category.save();
    res.status(201).send(category);
  } catch (e) {
    res.status(400).send(Error(e));
  }
};
