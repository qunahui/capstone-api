const mongoose = require("mongoose")
const Product = require("../models/product");
const Error = require("../utils/error");
const rp = require("request-promise")
const Inventory = require('../models/inventory');
const Variant = require("../models/variant")
const SendoVariant = require("../models/sendoVariant")
const LazadaVariant = require("../models/lazadaVariant")
const LazadaProduct = require("../models/lazadaProduct")
const SendoProduct = require("../models/sendoProduct")
const Storage = require("../models/storage")
const { htmlToText } = require('html-to-text');

module.exports.pushUpdatedToApi = async (req, res) => {
  const { variant } = req.body
  const { linkedIds } = variant
  if(linkedIds.length === 0) {
    return;
  }

  await Promise.all(linkedIds.map(async linkedId => {
    if(linkedId.platform === 'sendo') {
      const sendoVariant =  await SendoVariant.findOne({ _id: linkedId.id })
      const sendoProduct = await SendoProduct.findOne({ _id: sendoVariant.productId }).populate('variants').lean()
      const storage = await Storage.findOne({
        _id: req.user.currentStorage.storageId,
        sendoCredentials: {
          $elemMatch: {
            store_id: sendoProduct.store_id
          }
        }
      }, { "sendoCredentials.$": 1 })

      sendoProduct.variants = sendoProduct.variants.map(matchedVariant => {
        if(matchedVariant._id.toString() === linkedId.id) {
          return matchedVariant = {
            ...matchedVariant,
            price: variant.retailPrice,
            quantity: variant.inventories.available
          }
        }
        return matchedVariant
      })

      try {
        await rp({
          method: 'PATCH',
          url: `${process.env.API_URL}/api/sendo/products`,
          json: true,
          body: sendoProduct,
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            "Platform-Token": storage.sendoCredentials[0].access_token
          }
        })

      } catch(e) {
        console.log("Push to api failed: ", e.message)
      }
    } else if(linkedId.platform === 'lazada') {
      const lazadaVariant =  await LazadaVariant.findOne({ _id: linkedId.id })
      const lazadaProduct = await LazadaProduct.findOne({ _id: lazadaVariant.productId }).populate('variants').lean()
      const storage = await Storage.findOne({
        _id: req.user.currentStorage.storageId,
        lazadaCredentials: {
          $elemMatch: {
            store_id: lazadaProduct.store_id
          }
        }
      }, { "lazadaCredentials.$": 1 })

      lazadaProduct.variants = lazadaProduct.variants.map(matchedVariant => {
        if(matchedVariant._id.toString() === linkedId.id) {
          return matchedVariant = {
            ...matchedVariant,
            price: variant.retailPrice,
            quantity: variant.inventories.available
          }
        }
        return matchedVariant
      })

      lazadaProduct.attributes.short_description = htmlToText(lazadaProduct.attributes.short_description, { limits: 80 }).replace(/(\r\n|\n|\r)/gm, "");

      try {
        await rp({
          method: 'PATCH',
          url: `${process.env.API_URL}/api/lazada/products/price_quantity`,
          json: true,
          body: {
            lazadaProduct,
            variantId: lazadaProduct.variants.find(matchedVariant => matchedVariant._id.toString() === linkedId.id).SkuId
          },
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            "Platform-Token": storage.lazadaCredentials[0].access_token
          }
        })

        res.sendStatus(200)
      } catch(e) {
        console.log("Push to api failed: ", e.message)
      }
    }
  }))
}

module.exports.autoLinkVariant = async (req, res) => {
  const { variants } = req.body;
  const currentStorageId = req.user.currentStorage.storageId
  let success = 0, failure = 0
  try {
    
    await Promise.all(variants.map(async (variant) => {

        const matchSkuVariants = await Variant.find({sku: variant.sku}) //  variants co cung sku
        await Promise.all(matchSkuVariants.map(async(matchSkuVariant)=>{
          const product = await Product.findOne({_id: matchSkuVariant.productId},{storageId: 1})
          if(product.storageId.toString() == currentStorageId){  // variants thuoc storage hien tai
            await rp({
              method: 'POST',
              url: `${process.env.API_URL}/variants/link`,
              resolveWithFullResponse: true,
              headers: {
                'Authorization': 'Bearer ' + req.mongoToken
              },
              body: {
                variant: matchSkuVariant,
                platformVariant: variant
                
              },
              json: true
            }).then(res =>{
              if(res.statusCode == 200){
                //console.log("sucsess: "+ success)
                return success++
                
              }
            }).catch(error =>{
              if(error.statusCode == 400){
                //console.log("failure: "+ failure)
                return failure++
                
              }
            })
            
          }
        }))
        
    }));

    console.log("sucsess: "+ success)
    console.log("failure: "+ failure)
    res.send({
      success: success,
      failure: failure,
      variants: variants
    })
  } catch(e) {
    console.log("Liên kết thất bại: ", e.message)
    res.status(400).send(Error({ message: "Liên kết thất bại" }))
  }
}

module.exports.linkVariant = async (req, res) => {
  const { variant, platformVariant } = req.body;
  //console.log("Variant: ", variant)
  //console.log("PVariant: ", platformVariant)
  let updatedPlatVariant = {}
  console.clear()
  try {
    if(platformVariant.platform === 'sendo') {
      // link sendoP to P
      if(platformVariant.productId) {
        // variant
        await SendoVariant.updateOne({
          _id: platformVariant._id,
        }, {
          linkedId: variant._id
        })

        updatedPlatVariant = await SendoVariant.findOne({
          _id: platformVariant._id
        }).populate('linkedDetails').lean()
      } else if(!platformVariant.productId) {
        //console.log("link to sendo product instead", variant)
        await SendoProduct.updateOne({
          _id: platformVariant._id,
        }, {
          linkedId: variant._id
        })

        updatedPlatVariant = await SendoProduct.findOne({
          _id: platformVariant._id
        }).populate('linkedDetails').lean()
      }
      // link P to sendoP
      await Variant.updateOne({
        _id: variant._id,
      }, {
        $addToSet: {
          linkedIds: {
            id: platformVariant._id,
            platform: 'sendo',
            createdAt: new Date()
          }
        }
      })

      return res.status(200).send(updatedPlatVariant)
    } else if(platformVariant.platform === 'lazada') {
      await LazadaVariant.updateOne({
        _id: platformVariant._id,
      }, {
        linkedId: variant._id
      })

      await Variant.updateOne({
        _id: variant._id,
      }, {
        $addToSet: {
          linkedIds: {
            id: mongoose.Types.ObjectId(platformVariant._id),
            platform: 'lazada',
            createdAt: new Date()
          }
        }
      })

      let updatedPlatVariant = await LazadaVariant.findOne({
        _id: platformVariant._id
      }).populate('linkedDetails').lean()
  
      return res.status(200).send(updatedPlatVariant)
    }

    return res.status(400).send(Error({ message: 'Có gì đó sai sai !'}))
  } catch(e) {
    console.log("Liên kết thất bại: ", e.message)
    res.status(400).send(Error({ message: "Liên kết thất bại" }))
  }
}

module.exports.unlinkVariant = async (req, res) => {
  const { variant, platformVariant } = req.body;
  let updatedPlatVariant = {}
  console.clear()
  try {
    if(platformVariant.platform === 'sendo') {
      // link sendoP to P
      if(platformVariant.productId) {
        // variant
        await SendoVariant.updateOne({
          _id: platformVariant._id,
        }, {
          linkedId: null
        })

        updatedPlatVariant = await SendoVariant.findOne({
          _id: platformVariant._id
        }).populate('linkedDetails').lean()
      } else if(!platformVariant.productId) {
        await SendoProduct.updateOne({
          _id: platformVariant._id,
        }, {
          linkedId: null
        })

        updatedPlatVariant = await SendoProduct.findOne({
          _id: platformVariant._id
        }).populate('linkedDetails').lean()
      }
      // link P to sendoP
      await Variant.updateOne({
        _id: variant._id,
        linkedIds: {
          $elemMatch: {
            id: platformVariant._id,
          }
        }
      }, {
        $pull: {
          linkedIds: {
            id: mongoose.Types.ObjectId(platformVariant._id),
            platform: 'sendo'
          }
        }
      })

      return res.status(200).send(updatedPlatVariant)
    } else if(platformVariant.platform === 'lazada') {
      await LazadaVariant.updateOne({
        _id: platformVariant._id,
      }, {
        linkedId: null
      })

      await Variant.updateOne({
        _id: variant._id,
      }, {
        $pull: {
          linkedIds: {
            id: mongoose.Types.ObjectId(platformVariant._id),
            platform: 'lazada'
          }
        }
      })

      let updatedPlatVariant = await LazadaVariant.findOne({
        _id: platformVariant._id
      }).populate('linkedDetails').lean()
  
      return res.status(200).send(updatedPlatVariant)
    }

    return res.status(400).send(Error({ message: 'Có gì đó sai sai !'}))
  } catch(e) {
    console.log("Liên kết thất bại: ", e.message)
    res.status(400).send("Liên kết thất bại")
  }
}

module.exports.getAllVariant = async (req, res) => {
  try {
    
    const variants = await Variant.find({})
    
    res.send(variants)
  } catch (e) {
    res.status(500).send(Error(e));
  }

};

module.exports.getMMSVariantById = async function (req, res) {
  try {
    const variantId = req.params.id;
    const variant = await Product.find({ _id: variantId })
    res.send(variant)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createMMSVariant = async (req, res) => {
  try {
    const variant = new Variant({...req.body});

    await variant.save();

    const inventory = new Inventory({
      variantId: variant._id,
      actionName: 'Khởi tạo biến thể',
      change: {
        amount: variant.inventories.onHand,
        type: 'Tăng'
      },
      instock: variant.inventories.onHand,
      price: variant.inventories.initPrice,
    })

    await inventory.save()

    res.send(variant);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateVariant = async (req, res) => {
  const properties = Object.keys(req.body);

  try {
    const variant = await Variant.findOne({ _id: req.body._id });
    if (!variant) {
      res.status(404).send(variant);
    }

    const priceChanged = variant['retailPrice'] !== req.body['retailPrice']

    properties.forEach((prop) => (variant[prop] = req.body[prop]));

    await variant.save();

    if(priceChanged) {
      await rp({ 
        method: 'POST',
        url: `${process.env.API_URL}/variants/push-api`,
        json: true,
        body: {
          variant
        },
        headers: { 
          'Authorization' : 'Bearer ' + req.mongoToken
        }
      })
    }

    res.send(variant);


  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteVariant = async (req, res) => {
  console.log(req.params)
  try {
    const variant = await Variant.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) });

    if (!variant) {
      return res.status(404).send();
    }

    res.send(variant);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
