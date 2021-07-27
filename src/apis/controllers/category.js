const Error = require("../utils/error");
const Category = require('../models/category')
//const LazadaCategory = require('../models/lazadaCategory')


const saveAllCategory  = async (Category, idpath) =>{
  Category.map(async(item) => {
    const idpath1 = [...idpath, item.category_id]
    const category = new lazadaCategory({
      category_id: item.category_id,
      var: item.var,
      name: item.name,
      leaf: item.leaf,
      idpath: idpath1
    })
    await category.save()
    if(item.leaf == true)
    {
      return
    }else{
      saveAllCategory(item.children, idpath1)
    } 
  });
} 

module.exports.getListCategory = async (req,res) =>{
  const idpath = req.query.idpath ? req.query.idpath.map(i => parseInt(i)) : [];
  let query = {}
  const projection = {name: 1, category_id: 1, leaf: 1, idpath:1, namepath: 1}
  if (idpath.length == 0) {
    query = {idpath:{ $size: 1}}
  } else if(idpath.length != 0) {
    query = { idpath:{ $all: idpath ,$size: idpath.length+1 }}
  }

  try {
    const categories = await Category.find(query, projection)
    res.status(200).send(categories)
  } catch (e) {
    res.status(500).send(e.message)
  }
};

module.exports.searchCategory = async (req,res) =>{
  const search = req.query.search
  try {
    const categories = await Category.fuzzySearch({ query: search, minSize: 3 }).find({ leaf: true })
    console.log("Caaaa: ", categories)
    res.status(200).send(categories);
  } catch (e) {
    res.status(500).send(e.message);
  }
};
module.exports.createCategory = async (req, res) => {
  const item = req.body;
  try {
    await  new Category({
      idpath: item.idpath,
      namepath: item.namepath,
      category_id: item.category_id,
      var: item.var,
      name: item.name,
      leaf: item.leaf
    }).save();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
module.exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.find({category_id: req.params.id})
    res.status(200).send(category)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
module.exports.getCategoryByObjectId = async (req, res) => {
  try {
    const category = await Category.find({_id: req.params._id})
    res.status(200).send(category)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};
module.exports.updateCategory = async (req, res) => {
  const item = req.body
  try {
    const category = await Category.findOneAndUpdate({category_id: req.params.id},{...item},{returnOriginal: false});
    if (!category) {
      res.sendStatus(404);
    }
    res.status(200).send(category);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};
module.exports.deleteCategory = async (req, res) => {
  try {
      const category = await Category.findOneAndDelete({category_id: req.params.id});
      if (!category) {
        return res.sendStatus(404);
      }
      res.sendStatus(200)
  } catch (e) {
      res.status(500).send(Error(e));
  }
};

module.exports.all = async (req, res) => {
  const categories = await Category.find()
  res.status(200).send(categories)
}

module.exports.playGround = async (req, res) => {
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
  
        res.status(200).send(newCategories) 
      }
  
      addNamePath(categories)
    })
}

module.exports.addFuzzy = async (req, res) => {
  for await (const doc of Category.find().cursor()) {
      await Category.findByIdAndUpdate(doc._id, doc)
  }
  
  res.sendStatus(200)
}
module.exports.createLazadaCategory = async (req, res) => {
  const Category = req.body.data;
  try {
    saveAllCategory(Category, [])
  } catch (e) {
      res.status(500).send(Error(e));
  }
  res.sendStatus(200);
};