const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const request = require('request');
const Category = require('../models/category')
const SendoCategory = require('../models/sendoCategory')
// const saveAllCategory  = async (Category, idpath) =>{
//   Category.forEach(async(item) => {
//     const idpath1 = [...idpath, item.category_id]
//     const category = new lazadaCategory({
//       category_id: item.category_id,
//       var: item.var,
//       name: item.name,
//       leaf: item.leaf,
//       idpath: idpath1
//     })
//     await category.save()
//     if(item.leaf == true)
//     {
//       return
//     }else{
//       saveAllCategory(item.children, idpath1)
//     } 
    
//   });
  
// } 

// module.exports.getListCategory = async (req,res) =>{
//   try {
//     const categories = await Category.find({});
//     res.send(categories);
//   } catch (e) {
//     res.status(500).send(e.message);
//   }
// };

module.exports.getListCategory = async (req,res) =>{
  const idpath = req.query.idpath ? req.query.idpath.map(i => parseInt(i)) : [];
    if(idpath.length == 0) {
      try {
        const categories = await Category.find({idpath:{ $size: 1}}, {name: 1, category_id: 1, leaf: 1, idpath:1});
        res.send(categories);
      } catch (e) {
        res.status(500).send(e.message);
      }
    } else if(idpath.length != 0) {
      try {
        const categories = await Category.find({ idpath:{ $all:idpath ,$size: idpath.length+1 }}, {name: 1, category_id: 1, leaf: 1, idpath:1, namepath: 1});
        res.send(categories);
      } catch (e) {
        res.status(500).send(e.message);
      }
    }
    
};

module.exports.searchCategory = async (req,res) =>{
 
  const search = req.query.search
    
      try {
        const categories = await Category.find({leaf: true, name: new RegExp(search, 'i')});

        res.send(categories);
      } catch (e) {
        res.status(500).send(e.message);
      }
    
    
};
module.exports.createCategory = async (req, res) => {
  const item = req.body;

  const category = new Category({
    idpath: item.idpath,
    namepath: item.namepath,
    category_id: item.category_id,
    var: item.var,
    name: item.name,
    leaf: item.leaf
  });

  try {
    await category.save();
    res.send(category);
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
module.exports.updateCategory = async (req, res) => {
  const properties = Object.keys(req.body);


  try {
    const category = await Category.findOne({category_id: req.params.id});
    if (!category) {
      res.status(404).send(category);
    }

    properties.forEach((prop) => (category[prop] = req.body[prop]));
    
    category.save();

    res.send(category);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};
module.exports.deleteCategory = async (req, res) => {
  try {
      const category = await Category.findOneAndDelete({category_id: req.params.id});
  
      if (!category) {
        return res.status(404).send();
      }
  
      res.send(category)
    } catch (e) {
      res.status(500).send(Error(e));
    }
};
// module.exports.createLazadaCategory = async (req, res) => {
//   const Category = req.body.data;
//   try {
    
//     saveAllCategory(Category, [])
  
//   } catch (e) {
//       res.status(500).send(Error(e));
//   }
//   res.send("done");
// };