const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const request = require('request');
const Category = require('../models/category')

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
  console.log(req.query)
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

// module.exports.createLazadaCategory = async (req, res) => {
//   const Category = req.body.data;
//   try {
    
//     saveAllCategory(Category, [])
  
//   } catch (e) {
//       res.status(500).send(Error(e));
//   }
//   res.send("done");
// };