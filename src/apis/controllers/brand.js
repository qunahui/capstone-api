
const Error = require("../utils/error");
const Brand = require("../models/brand")

module.exports.searchBrands =  async (req, res) => {
    const search = req.params.search 
    try { 
      //scoring sometimes wrong, so I make the exact result always the best match
        let brands = await Brand.fuzzySearch({ query: search, minSize: 5 }).limit(10)
        let exactIndex = brands.findIndex(i => i.name.toLowerCase().trim() === search.toLowerCase().trim())
        if(exactIndex === -1) {
            let exact = await Brand.findOne({ name: { $regex: new RegExp('^' + search.toLowerCase() + '$', "i") }})
            if(exact) {
                brands = [exact, ...brands]
            }
        } else {
            let swap = brands[0]
            brands[0] = brands[exactIndex]
            brands[exactIndex] = swap
        }
        res.status(200).send(brands)
    } catch(e) {
        console.log(e.message)
        res.status(500).send(Error({ message: 'Something went wrong, ' + e.message }))
    }
}

module.exports.createBrans = async (req, res) => {
    let all = []
    for(let index = 1; index <= 69; index++) {
        let options = {
            method: 'GET',
            url: `https://market-place.sapoapps.vn/product-listing/brand?query=&page=${index}`,
            headers: {
                'authority': 'market-place.sapoapps.vn',
                'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                'accept': 'application/json',
                'dnt': '1',
                'x-market-token': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlyaXJpcmkiLCJleHAiOjE2MTg3NDA5NTMsImlhdCI6MTYxODY1NDU1M30.W1XppG0G_aQeLg-yAHGJcvmKmNaL7HOuLpraQzwpEsY',
                'sec-ch-ua-mobile': '?0',
                'authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlyaXJpcmkiLCJleHAiOjE2MTg3NDA5NTMsImlhdCI6MTYxODY1NDU1M30.W1XppG0G_aQeLg-yAHGJcvmKmNaL7HOuLpraQzwpEsY',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://market-place.sapoapps.vn/home/product-listing/51032?tenant=kriririri.mysapo.vn&hmac=nF4U8lJ0eLpVU6FI3EeIupmzlUzFX9KBuxQwbsE%2fcWM%3d&timestamp=1618654551791',
                'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8'
            }
        };
        let response = await rp(options)
        let brands = JSON.parse(response).brands
        console.log(brands.length)
        all = all.concat(brands)
    }

    await Brand.insertMany(all)
    res.status(200).send({ length: all.length })
}