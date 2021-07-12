const Error = require("../utils/error");
const LazadaAttribute = require("../models/lazadaAttribute")
const fs = require('fs')
const Category = require('../models/category')
//const LazadaAttribute = require('../models/lazadaAttribute')
const rp = require('request-promise')
const util = require('util')

module.exports.getLazadaAttribute = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId)
    try {
        const attrs = await LazadaAttribute.findOne({ categoryId })
        // find in lazada api if not exists
        const apiAttrs = await rp({ 
            method: 'GET',
            url: `${process.env.API_URL}/api/lazada/attribute/` + categoryId,
            headers: {
                'Authorization': 'Bearer ' + req.mongoToken,
                'Platform-Token': req.accessToken
            },
            json: true,
        })

        return res.status(200).send({
            api: apiAttrs,
            db: attrs
        })
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(Error({ message: 'Something went wrong !'}))
    }
}

module.exports.test =  async (req, res) => {
    const all = await LazadaAttribute.find({})
    
    let hmmm = []
    
    all.map((i, index) => {
        i.attributes.map(att => {
        if(att.input_type === 9) {
            hmmm.push(att)
        }
        })
        console.log(index)
    })
    
    res.send(hmmm)
}

module.exports.create = async (req, res) => {
    try {
        // const allLeafCategory = await Category.find({ leaf: true })
        let all = []
        for(let index = 9092; index <= 9104; index++) {
        let options = {
            method: 'GET',
            url: `https://market-place.sapoapps.vn/product-listing/attribute?categoryId=${index}&channelType=2`,
            headers: {
                'authority': 'market-place.sapoapps.vn',
                'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                'accept': 'application/json',
                'dnt': '1',
                'x-market-token': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlyaXJpcmkiLCJleHAiOjE2MTg4MjU4MjMsImlhdCI6MTYxODczOTQyM30.VBENI3tf4JmUaurgLH5VmCSRQEDBqAt8Enb1pzN_00k',
                'sec-ch-ua-mobile': '?0',
                'authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlyaXJpcmkiLCJleHAiOjE2MTg4MjU4MjMsImlhdCI6MTYxODczOTQyM30.VBENI3tf4JmUaurgLH5VmCSRQEDBqAt8Enb1pzN_00k',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://market-place.sapoapps.vn/home/product-listing/51032',
                'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8'
            }
        };
    
        let response = await rp(options)
        if(response) {
            let parsed = JSON.parse(response)
            if(parsed['category'].channel_type === 2) {
                all.push({
                    categoryId: parsed['category'].id,
                    categoryName: parsed['category'].name,
                    categoryNamepath: parsed['category'].node_name.split('|').filter(i => i !== ''),
                    attributes: parsed['attributes']
                })
            }
        }
        console.log(index)
        }
    
        await LazadaAttribute.insertMany(all)
        console.log("Done")
        res.status(200).send({ data: all.length })
    } catch(e) {
        console.log(e.message)
        res.status(400).send(e.message)
    }
}

module.exports.fix = async (req, res) => {
    let missing = []
    let loop = 0
    for await (const doc of Category.find().cursor()) {
        const found = await LazadaAttribute.findOne({ categoryNamepath: doc.namepath })
        if(found){
            if(found.categoryId !== doc.category_id) {
                await LazadaAttribute.findByIdAndUpdate(found._id, {
                categoryId: doc.category_id
                })
            }
        } else {
            missing.push(doc)
        }
        console.log("Loop: ", loop++)
    }
    
    fs.writeFile('missing.json', JSON.stringify({
        length: missing.length,
        missing
    }), 'utf-8', () => console.log("Ok"))
    
    res.sendStatus(200)
}