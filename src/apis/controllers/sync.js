const crypto = require('crypto')
const rp = require('request-promise');
const Error = require('../utils/error')

module.exports.syncDataFromChosenCres = async (req, res) => {
  const { payload } = req.body
  try { 
    let platformProducts = []
    await Promise.all(payload.map(async credential => {
      if(credential.platform_name === 'sendo') {
        //call sendo api to fetch product
        await rp({
          method: 'POST',
          uri: `{process.env.API_URL}/sendo/products/fetch`,
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            'Platform-Token': credential.access_token
          },
          body: {
            store_id: credential.store_id
          },
          json: true
        }).then(res => { platformProducts = [...platformProducts, ...res]})
  
      } else if(credential.platform_name === 'lazada') {
        //call lazada api to fetch product
        await rp({
          method: 'POST',
          uri: `{process.env.API_URL}/lazada/products/fetch`,
          headers: {
            'Authorization': 'Bearer ' + req.mongoToken,
            'Platform-Token': credential.access_token
          },
          body: {
            store_id: credential.store_id
          },
          json: true
        }).then(res => { platformProducts = [...platformProducts, ...res]})
      }
    }))

    res.status(200).send(platformProducts)
  } catch(e) {
    res.status(500).send(Error({ message: "Something went wrong!"}))
  }
}