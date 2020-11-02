const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
const ProductDetail = require("../models/productDetail");

module.exports.getAllProduct = async function (req, res) {
  try {
    let filter = {};

    const query = req.query;

    for (const property in query) {
      if (
        property !== "limit" &&
        property !== "skip" &&
        property !== "$lte" &&
        property !== "$gte"
      ) {
        filter[property] = query[property];
      }
    }

    if (filter.name) {
      const regex = new RegExp(filter.name, "i");
      filter.name = regex;
    }

    if (query.$lte || query.$gte) {
      filter.averageRating = {};

      if (query.$lte) {
        filter.averageRating.$lte = query.$lte;
      }

      if (query.$gte) {
        filter.averageRating.$gte = query.$gte;
      }
    }

    console.log(filter);

    const products = await Product.find(filter, "averageRating", {
      limit: parseInt(query.limit),
      skip: parseInt(query.skip),
    })
      .populate("productDetails")
      .lean();

    res.send(products);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.getProductById = async function (req, res) {
  try {
    const product = await Product.findById(req.params.id);
    await product.populate("productDetails").execPopulate();

    if (!product) {
      return res.status(404).send();
    }

    res.send({ product, productDetails: product.productDetails });
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createProduct = async (req, res) => {
  const item = req.body;
  const details = item.productDetails;

  const product = new Product({
    name: item.name,
    searchName: item.searchName,
    description: item.description,
    details: item.details,
    averageRating: item.averageRating,
    categoryID: item.categoryID,
  });

  try {
    await product.save();

    details.forEach(async (detail) => {
      const productDetail = new ProductDetail({
        ...detail,
        productID: product._id,
      });
      await productDetail.save();
    });
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.editProduct = async (req, res) => {
  const properties = Object.keys(req.body);

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).send(product);
    }

    properties.forEach((prop) => (product[prop] = req.body[prop]));
    product.save();

    res.send(product);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete(req.params.id);

    if (!product) {
      return res.status(404).send();
    }

    res.send(product).send();
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
