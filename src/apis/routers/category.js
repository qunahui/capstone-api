const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const controller = require("../controllers/category");
const Category = require("../models/category");


router.get("/", auth, controller.getListCategory);
router.get("/all", async (req, res) => {
  const Category = require('../models/category')
  await Category.find({}, (err, categories) => {
    res.send(categories)
  })
})

router.get("/playground", async (req, res) => {
  const Category = require('../models/category')
  const LazadaCategory = require('../models/lazadaCategory')
  await LazadaCategory.find({}, (err, categories) => {
    if(err) {
       res.send(err)
    }
    async function addNamePath(categories) {
      const namePathArr = [];
      categories.map(category => {
        namePathArr[category.category_id] = category.name
      })

      const newCategories = await Promise.all(categories.map(async category => {
        let namepath = undefined
        if(category.leaf === true){
          namepath = []
          category.idpath.map(path => {
            // console.log(namePathArr[path])
            namepath.push(namePathArr[path])
          })
        }

        let savedCategory = new Category({
          idpath: category.idpath,
          category_id: category.category_id,
          var: category.var,
          name: category.name,
          leaf: category.leaf,
          namepath
        })

        await savedCategory.save()

        return {
          idpath: category.idpath,
          _id: category.id,
          category_id: category.category_id,
          var: category.var,
          name: category.name,
          leaf: category.leaf,
          __v: category.__v,
          namepath
        }
      }))

      
      res.send(newCategories) 
    }

    addNamePath(categories)
  })
})

router.get("/search", auth, controller.searchCategory)

router.get('/add-fuzzy', async (req, res) => {
  for await (const doc of Category.find().cursor()) {
    await Category.findByIdAndUpdate(doc._id, doc)
  }

  res.status(200).send("Ok")
})

router.post("/", auth, controller.createCategory);
router.get("/:id", auth, controller.getCategoryById);
router.patch("/:id", auth, controller.updateCategory);
router.delete("/:id", auth, controller.deleteCategory);

// router.get("/", auth, controller.getListCategory);

// router.post("/create-lazada-category", controller.createCategory) // just for dev, not for user

module.exports = router;