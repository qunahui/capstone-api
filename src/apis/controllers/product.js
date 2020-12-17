const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const util = require('util')

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
<<<<<<< HEAD
  const item = req.body.data;
=======
  const item = req.body;
>>>>>>> 077e60c95ca14a2c48e46f4050c35f6668ff40e2
  //util.inspect(item, false, null, true /* enable colors */)
  //console.log(item)
  // const array = item.attributes

  // array.forEach(element => {
  //   var arr = element.attribute_values.filter((child) => {
  //     return child.is_selected === true
  //   });
  //   element.attribute_values = arr
  // });
<<<<<<< HEAD

  const product = new Product({
    store_ids: [req.body.store_id],
    sendo_product_id: item.id,
    name: item.name,
    sku: item.store_sku,
    price: item.price,
    //weight: item.weight,
    stock_availability: item.stock_availability,
    stock_quantity: item.stock_quantity,
    //description: item.description,
    //cat2_id: item.cat2_id,
    //cat3_id: item.cat3_id,
    sendo_cat4_id: item.cat4_id,
    product_status: item.product_status,
=======
  console.log("received data")
  const product = new Product({
    store_ids: [req.shop_key],
    store_name: item.store_name,
    sendo_product_id: item.id,
    name: item.name,
    sku: item.store_sku,
    sku: item.sku,
    price: item.price,
    //price: item.special_price,
    weight: item.weight,
    stock_availability: item.stock_availability,
    stock_availability: item.stock,
    stock_quantity: item.stock_quantity,
    //description: item.description,
    sendo_cat4_id: item.cat4_id,
    sendo_product_status: item.product_status,
>>>>>>> 077e60c95ca14a2c48e46f4050c35f6668ff40e2
    //product_tags: item.product_tags,
    updated_date_timestamp: item.updated_date_timestamp,
    created_date_timestamp: item.created_date_timestamp,
    // seo: item.seo,
    sendo_product_link: item.product_link,
    //product_relateds: item.product_relateds,
    //seo_key_word: item.seo_key_word,
    //seo_title: item.seo_title,
    //seo_description: item.seo_description,
    //seo_score: item.seo_score,
    product_image: item.product_image,
    //category_4_name: item.category_4_name,
<<<<<<< HEAD
    updated_user: item.updated_user,
=======
    sendo_updated_user: item.updated_user,
>>>>>>> 077e60c95ca14a2c48e46f4050c35f6668ff40e2
    //url_path: item.url_path,
    //video_links: item.video_links,
    //height_product: item.height_product,
    //length_product: item.length_product,
    //width_product: item.width_product,
    unit_id: item.unit_id,
    avatar: item.picture,
    //product_pictures: item.product_pictures,
    //attributes: array,
    // special_price: item.special_price,
    // promotion_from_date_timestamp: item.promotion_form_date_timestamp,
    // promotion_to_date_timestamp: item.promotion_to_date_timestamp,
    // is_promotion: item.is_promotion,
    extend_shipping_package: item.extend_shipping_package,
    variants: item.variants,
    //is_config_variant: item.is_config_variant,
    //is_invalid_variant:  item.is_invalid_variant,
    voucher: item.voucher
    // product_category_types: item.product_category_types,
    //is_flash_sales: item.is_flash_sales,
    //campain_status: item.campain_status,
    //can_edit: item.can_edit,
    //sendo_video: item.sendo_video,
    //installments: item.installments

  });

  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateProduct = async (req, res) => {
<<<<<<< HEAD
  console.log("Received ping update: ", req.body)
=======
  console.log("Received ping update: ")
>>>>>>> 077e60c95ca14a2c48e46f4050c35f6668ff40e2
  //console.log(req.body)
  // const properties = Object.keys(req.body);


  // try {
  //   const product = await Product.findById(req.body.data.id);

  //   if (!product) {
  //     res.status(404).send(product);
  //   }

  //   properties.forEach((prop) => (product[prop] = req.body[prop]));
  //   product.save();

  //   res.send(product);
  // } catch (e) {
  //   res.status(404).send(Error(e));
  // }
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
