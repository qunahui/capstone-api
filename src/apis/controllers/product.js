const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
const ProductDetail = require("../models/productDetail");
const sendo = require('./sendo')
const request = require('request');

module.exports.getAllProduct = async (req, res) => {
  try {
    
    const products = await Product.find({})
    
    res.send(products)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getProductById = async function (req, res) {
  try {
    const productId = req.params.id;
    const product = await Product.find({id: productId})
    
    res.send(product)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createProduct = async (req, res) => {
  const item = req.body;
  

  const product = new Product({
    id: item.id,
    name: item.name,
    sku: item.sku,
    price: item.price,
    weight: item.weight,
    stock_availability: item.stock_availability,
    stock_quantity: item.stock_quantity,
    description: item.description,
    cate_4_id: item.cate_4_id,
    status: item.status,
    tags: item.tags,
    updated_date_timestamp: item.updated_date_timestamp,
    created_date_timestamp: item.created_date_timestamp,
    // seo: item.seo,
    link: item.link,
    relateds: item.relateds,
    seo_keyword: item.seo_keyword,
    seo_title: item.seo_title,
    seo_description: item.seo_description,
    seo_score: item.seo_score,
    image: item.image,
    category_4_name: item.category_4_name,
    updated_user: item.updated_user,
    url_path: item.url_path,
    video_links: item.video_links,
    height: item.height,
    length: item.length,
    width: item.width,
    unit_id: item.unit_id,
    avatar: item.avatar,
    pictures: item.pictures,
    attributes: item.attributes,
    special_price: item.special_price,
    promotion_from_date_timestamp: item.promotion_form_date_timestamp,
    promotion_to_date_timestamp: item.promotion_to_date_timestamp,
    is_promotion: item.is_promotion,
    extend_shipping_package: item.extend_shipping_package,
    variant: item.variant,
    is_config_variant: item.is_config_variant,
    is_invalid_variant:  item.is_invalid_variant,
    voucher: item.voucher,
    product_category_types: item.product_category_types,
    is_flash_sales: item.is_flash_sales,
    campain_status: item.campain_status,
    can_edit: item.can_edit,
    sendo_video: item.sendo_video,
    installments: item.installments

  });

  try {
    await product.save();
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
