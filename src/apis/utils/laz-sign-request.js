const crypto = require('crypto')


const keysort = (unordered) => {
  return Object.keys(unordered)
    .sort()
    .reduce((ordered, key) => {
      ordered[key] = unordered[key]
      return ordered
    }, {})
}

const concatDictionaryKeyValue = (object) => {
  return Object.keys(object).reduce(
    (concatString, key) => concatString.concat(key + object[key]),
    '',
  )
}
module.exports.signRequest = (
  appSecret,
  apiPath,
  params,
) => {
  const keysortParams = keysort(params)

  const concatString = concatDictionaryKeyValue(keysortParams)

  const preSignString = apiPath + concatString

  const hash = crypto
    .createHmac('sha256', appSecret)
    .update(preSignString)
    .digest('hex')

  return hash.toUpperCase()
}
