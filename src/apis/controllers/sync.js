const crypto = require('crypto')
const rp = require('request-promise');

module.exports.syncDataFromChosenCres = async (req, res) => {
  let products = [];
  const { payload } = req.body
  await Promise.all(payload.map(async credential => {
    if(credential.platform_name === 'sendo') {
      //call sendo api to fetch product
      // const result = await rp({
      //   method: 'GET'
      // })
    } else if(credential.platform_name === 'lazada') {
      //call lazada api to fetch product
    }
  }))
}