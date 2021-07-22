const LazadaProduct = require("../models/lazadaProduct");
const { LazadaRequest, LazadaClient } = require('lazada-sdk-client');
const mongoose = require('mongoose')
const Error = require("../utils/error");
const rp = require('request-promise');
const Variant = require('../models/variant')
const timeDiff = require("../utils/timeDiff");
const LazadaVariant = require("../models/lazadaVariant");
const Category = require('../models/category')
const Storage = require("../models/storage");
const LazadaAttribute = require("../models/lazadaAttribute")

const apiUrl = 'https://api.lazada.vn/rest'
const appSecret = process.env.LAZADA_APP_SECRET
const appKey = process.env.LAZADA_APP_KEY
const signMethod = 'sha256'

const createLazadaProduct = async (item, additionalData) => {
  try {
    const attributes = await LazadaAttribute.find({ categoryId: item.primary_category })

    const variants = item.skus

    const variantAttributes = attributes.filter((attribute) => {
      return attribute.is_variant_attribute === true
    })
    variants.map(variant => {
      const variant_attributes = []
      variantAttributes.map(prop => {
        const attribute_name = prop.name
        const option_value = variant[`${attribute_name}`]
        variant_attributes.push({
          attribute_name: attribute_name,
          option_value: option_value
        })
        delete variant[`${attribute_name}`]
      });
      variant.variant_attributes = variant_attributes
    });

    const itemCategoryName = await Category.findOne({ category_id: parseInt(item.primary_category) })

    let query = { store_id: additionalData.store_id, id: item.item_id },
      update = {
        avatar: variants.length > 0 && variants[0].Images[0],
        store_id: additionalData.store_id,
        id: item.item_id,
        primary_category: item.primary_category,
        primary_category_name: itemCategoryName.namepath.join(' > '),
        attributes: item.attributes,
        updated_date_timestamp: new Date(parseInt(item.updated_time)),
        created_date_timestamp: new Date(parseInt(item.created_time))
      },
      options = { upsert: true, new: true };

    const lazadaProduct = await LazadaProduct.findOneAndUpdate(query, update, options)

    const dbLazVariants = await LazadaVariant.find({ productId: lazadaProduct._id })

    dbLazVariants.map(async (dbLazVariant) => {
      const index = variants.findIndex(i => i.ShopSku === dbLazVariant.ShopSku)
      if (index === -1) {
        console.log("delete: ", dbLazVariant._id)
        const deleted = await LazadaVariant.findOneAndDelete({ _id: dbLazVariant._id }, { lean: true })
        if (deleted.linkedId) {
          await Variant.updateOne({
            _id: deleted.linkedId,
          }, {
            $pull: {
              linkedIds: mongoose.Types.ObjectId(deleted._id)
            }
          })
        }
      }
    })

    variants.map(async (variant) => {
      await LazadaVariant.findOneAndUpdate({ ShopSku: variant.ShopSku, productId: lazadaProduct._id }, {
        ...variant,
        sku: variant.SellerSku,
        avatar: variant.Images,
        productId: lazadaProduct._id
      }, options);
    })
  } catch (e) {
    console.log("dwqdwqwq", e.message)
  }
};

module.exports.createLazadaProduct = createLazadaProduct

module.exports.getAllProducts = async (req, res) => {
  try {
    const { storeIds } = req.query;
    let lazadaProducts = [];
    await Promise.all([...storeIds].map(async storeId => {
      const products = await LazadaProduct.find({ store_id: storeId }).populate({
        path: 'variants',
        populate: {
          path: 'linkedDetails'
        }
      }).lean()
      lazadaProducts = [...lazadaProducts, ...products]
    }))


    return res.status(200).send(lazadaProducts)
  } catch (e) {
    console.log(e)
    return res.status(500).send(Error({ message: 'Something went wrong !' }))
  }
}

module.exports.fetchDeletedProducts = async (req, res) => {
  try {
    const { lastSync } = req.body
    const apiPath = '/products/get'
    const accessToken = req.accessToken
    const lazFormatDate = lastSync.split('.')[0].concat('+0700')

    const client = new LazadaClient(apiUrl, appKey, appSecret)
    const request = new LazadaRequest(apiPath, 'GET');
    request.addApiParam("filter", "deleted"); // http method default is post
    request.addApiParam("update_after", lazFormatDate);
    const response = await client.execute(request, accessToken);
    const { data } = response.data
    const products = data.products || []
    res.status(200).send(products)
  } catch (e) {
    res.status(400).send(Error(e))
  }
}

module.exports.fetchProducts = async (req, res) => {
  const { store_id, lastSync } = req.body
  const apiPath = '/products/get'
  const accessToken = req.accessToken
  // const lazFormatDate = lastSync.split('.')[0].concat('+0700')

  try {
    const client = new LazadaClient(apiUrl, appKey, appSecret)
    const request = new LazadaRequest(apiPath, 'GET');
    request.addApiParam("filter", "live");
    // request.addApiParam("update_after", lazFormatDate);
    const response = await client.execute(request, accessToken);
    const products = response.data.data.products || []
    await Promise.all(products.map(async product => {
      console.log(product)
      const lazadaProduct = await LazadaProduct.findOne({ id: product.item_id, store_id })
      if (lazadaProduct) {
        const secondDiff = timeDiff(new Date(parseInt(product.updated_time)), new Date(lazadaProduct.updated_date_timestamp)).secondsDifference
        if (secondDiff === 0) {
          return product;
        } else if (secondDiff < 0) {
          //xu ly push len api lazada
          //return;
        }
      }

      await createLazadaProduct(product, { store_id })
    }))
  } catch (e) {
    console.log(e)
    res.status(500).send(Error(e));
  }
  const lazadaProducts = await LazadaProduct.find({ storageId: req.body.storageId, store_id: req.body.store_id })

  res.status(200).send(lazadaProducts)
}

module.exports.syncProducts = async (req, res) => {
  const { payload } = req.body
  const { storageId } = req.user.currentStorage
  //check token
  console.clear()
  let newCredential = null;
  try {
    newCredential = await rp({
      method: 'POST',
      url: `${process.env.API_URL}/api/lazada/login`,
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': payload.access_token
      },
      body: {
        credential: payload
      },
      json: true
    })

  } catch (e) {
    console.log(e.message)
    return res.status(400).send(Error({ message: 'Lấy lazada token thất bại !' }))
  }

  if (newCredential.isRefreshExpired) {
    return res.status(400).send(Error({
      message: "Refresh token đã hết hạn !",
    }))
  }

  // fetch deleted products
  if (newCredential.lastSync) {
    const options = {
      method: 'POST',
      url: `${process.env.API_URL}/lazada/products/fetch-deleted`,
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': newCredential.access_token
      },
      body: {
        store_id: payload.store_id,
        lastSync: newCredential.lastSync
      },
      json: true
    }

    const deletedProducts = await rp(options)
    console.log(deletedProducts)
    await Promise.all(deletedProducts.map(async product => {
      const lazId = await LazadaProduct.findOne({ id: product.item_id })
      if (lazId) {
        // await LazadaVariant.deleteMany({ productId: lazId._id })
        // await LazadaProduct.deleteOne({ _id: lazId._id })
      }
    }))
  }

  //fetch live products
  try {
    const options = {
      method: 'POST',
      url: `${process.env.API_URL}/lazada/products/fetch`,
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': newCredential.access_token
      },
      body: {
        store_id: payload.store_id,
        lastSync: newCredential.lastSync
      },
      json: true
    }

    await rp(options)

    await Storage.updateOne({
      _id: storageId,
      lazadaCredentials: {
        $elemMatch: {
          _id: newCredential._id,
          store_id: newCredential.store_id
        }
      }
    }, {
      $set: {
        "lazadaCredentials.$.lastSync": new Date(),
      }
    })

    return res.status(200).send({
      message: "Đồng bộ thành công !",
    })
  } catch (e) {
    return res.status(e.response.statusCode).send(Error({ message: e.response.statusMessage }))
  }

}

module.exports.getProductById = async (req, res) => {
  const id = req.params._id
  try {
    const lazadaproduct = await LazadaProduct.findOne({ _id: id }).populate('variants').lean()
    res.status(200).send(lazadaproduct)
  } catch (e) {
    res.status(500).send(Error({ message: 'Có gì đó sai sai: , ' + e.message }))
  }
}

module.exports.deleteProduct = async (req, res) => {
  const id = req.params._id
  let sellerSkuList = []
  try {
    const lazadaProduct = await LazadaProduct.findOne({ _id: id }).populate('variants').lean()
    if (!lazadaProduct) {
      return res.sendStatus(404)
    }
    //unlink Variant
    lazadaProduct.variants.map(async (platformVariant) => {
      sellerSkuList.push(variant.sku)
      
      await Variant.updateOne({
        _id: platformVariant.linkedId,
        linkedIds: {
          $elemMatch: {
            id: platformVariant._id,
          }
        }
      }, {
        $pull: {
          linkedIds: {
            id: mongoose.Types.ObjectId(platformVariant._id),
            platform: 'lazada'
          }
        }
      })
      //delete SendoVariant
      await LazadaVariant.findOneAndDelete({ _id: platformVariant._id })
    })
    //delete lazadaProduct on platform
    await rp({
      method: 'DELETE',
      url: `${process.env.API_URL}/api/lazada/products/`,
      headers: {
        'Authorization': 'Bearer ' + req.mongoToken,
        'Platform-Token': req.accessToken
      },
      body: {
        sellerSkuList: sellerSkuList
      },
      json: true
    })
    //delete lazadaProduct
    await LazadaProduct.findByIdAndDelete({ _id: lazadaProduct._id })

    res.sendStatus(200)
  } catch (e) {
    res.status(500).send(Error(e));
  }
}
