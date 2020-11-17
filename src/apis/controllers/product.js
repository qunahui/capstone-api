const auth = require("../../middlewares/auth");
const Product = require("../models/product");
const Error = require("../utils/error");
const ProductDetail = require("../models/productDetail");
const sendo = require('./sendo')
const request = require('request');

module.exports.searchProduct = async (req, res) => {
//const accessToken = await sendo.getSendoToken();
 try {
  const options = {
    method: 'POST',
    url: 'https://open.sendo.vn/api/partner/product/search',
    headers: {
    Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTA4OTQ5MywiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.wmN3BfaFOjEaPniRYD1RefTbnbzHDhmo0_HyqkbMHxA',
    'Content-Type': 'application/json',
    'cache-control': 'no-cache'
    },
    body: JSON.stringify({"page_size":10,"product_name":"","date_from":"2020-05-01","date_to":"2020-12-28","token":""})
  
  };
  request(options, (error, response) => {
    //if (error) throw new Error(error);
    //console.log(response.body);
    const products = JSON.parse(response.body)
    res.send(products)
  });
 } catch (e) {
  res.status(500).send(Error(e));
 }
};

module.exports.getProductById = async function (req, res) {
  try {
    const productId = req.query.id;
    const options = {
      method: 'GET',
      url: "https://open.sendo.vn/api/partner/product?id=" + productId,
      headers: {
      Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAwMDkxNiwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.U_6WzhCsliMUVFApHqbjFF6EbDwaUxWgIDAHouZ4-j8',
      },
    };
    request(options, function (error, response) {
    // if (error) throw new Error(error);
    //console.log(response.body);
      const product = JSON.parse(response.body)
      res.send(product)
    });
  
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createProduct = async (req, res) => {
  const item = req.body;
  

  const product = new Product({
    id: item.id,
    category_4_name: item.category_4_name,
    attributes: item.attributes,
    certificate_file: item.certificate_file,
    image: item.image,
    link: item.link,
    name: item.name,
    price: item.final_price_min,
    rating: item.rating,
    status: item.status,
    status_name: item.status_name,
    stock: item.stock,
    promotion_price: item.promotion_price,
    stock_quantity: item.stock_quantity,
    can_delete: item.can_delete,
    can_edit: item.can_edit,
    can_share: item.can_share,
    can_up: item.can_up,
    sku: item.sku,
    cate_4_id: item.cate_4_id,
    store_name: item.store_name,
    is_promotion: item.is_promotion,
    up_product_date_timestamp: item.up_product_date_timestamp,
    weight: item.weight,
    is_off: item.is_off,
    reason_comment: item.reason_comment,
    url_path: item.url_path,
    review_date_timestamp: item.review_date_timestamp,
    updated_user: item.updated_user,
    is_review: item.is_review,
    file_attachments: item.file_attachments,
    brand_name: item.brand_name,
    reason_code: item.reason_code,
    special_price: item.special_price,
    promotion_from_date_timestamp: item.promotion_form_date_timestamp,
    promotion_to_date_timestamp: item.promotion_to_date_timestamp,
    unit_id: item.unit_id,
    updated_at_timestamp: item.updated_at_timestamp,
    height: item.height,
    length: item.length,
    width: item.width,
    shipping_images: item.shipping_images,
    final_price_min: item.final_price_min,
    final_price_max: item.final_price_max,
    is_config_variant: item.is_config_variant,
    variants_length: item.variants_length,
    voucher: item.voucher
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
