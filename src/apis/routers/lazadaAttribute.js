const express = require("express");
const router = express.Router();
const fs = require('fs')
const Category = require('../models/category')
const LazadaAttribute = require('../models/lazadaAttribute')
const { signRequest } = require('../utils/laz-sign-request')
const rp = require('request-promise')



router.get('/count', async (req, res) => {
  const total = await Category.find({ leaf: true })
  res.status(200).send({ length: total.length })
})

router.get('/search', async (req, res) => {
  const search = req.query.search
    
  try {
    const attributes = await LazadaAttribute.find({categoryName: new RegExp(search, 'i')});

    res.send(attributes);
  } catch (e) {
    res.status(500).send(e.message);
  }

})
router.get('/update-attribute-name/', async (req, res) => {
  var i = 0
    
  try {
   for(i=0;i<=1380;i++){
    console.log(i)
    await LazadaAttribute.updateMany({ 
      attributes: {
        $elemMatch: {
          id: i
        }
      }
    } , {
      $set: {
        "attributes.$.attribute_name": attributeLabel[i]
      }
    })
     
   }
    res.send("done");
  } catch (e) {
    res.status(500).send(e.message);
  }

})
router.get('/find-null/', async (req, res) => {
    
  try {
    const Name = await LazadaAttribute.find({"attributes.attribute_name": 'null'});
    
    res.send(Name)
  } catch (e) {
    res.status(500).send(e.message);
  }

})
// router.get("/create", async (req, res) => {
//   try {
//     // const allLeafCategory = await Category.find({ leaf: true })
//     let all = []
//     for(let index = 1; index <= 15999; index++) {
//       var options = {
//         'method': 'GET',
//         'url': `https://market-place.sapoapps.vn/product-listing/attribute?categoryId=${index}`,
//         'headers': {
//           'authority': 'market-place.sapoapps.vn',
//           'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
//           'accept': 'application/json',
//           'dnt': '1',
//           'x-market-token': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlyaXJpcmkiLCJleHAiOjE2MTg3NTE3NTAsImlhdCI6MTYxODY2NTM1MH0.uH-BjBVLJmQlGq1666h_NQICi6t4dM2rTaIyK0BEFiU',
//           'sec-ch-ua-mobile': '?0',
//           'authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlyaXJpcmkiLCJleHAiOjE2MTg3NTE3NTAsImlhdCI6MTYxODY2NTM1MH0.uH-BjBVLJmQlGq1666h_NQICi6t4dM2rTaIyK0BEFiU',
//           'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
//           'sec-fetch-site': 'same-origin',
//           'sec-fetch-mode': 'cors',
//           'sec-fetch-dest': 'empty',
//           'referer': 'https://market-place.sapoapps.vn/home/product-listing/51032',
//           'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8'
//         }
//       };

//       let response = await rp(options)
//       if(response) {
//         let parsed = JSON.parse(response)
//         all.push({
//           categoryId: parsed['category'].id,
//           categoryName: parsed['category'].name,
//           categoryNamepath: parsed['category'].node_name.split('|').filter(i => i !== ''),
//           attributes: parsed['attributes']
//         })
//       }
      
//       console.log(index)
//     }

//     await LazadaAttribute.insertMany(all)
//     res.status(200).send({ length: all.length })
//   } catch(e) {
//     console.log(e.message)
//     res.status(400).send(e.message)
//   }
// })

router.get('/fix', async (req, res) => {
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

  res.status(200).send("Ok")
})


module.exports = router;
