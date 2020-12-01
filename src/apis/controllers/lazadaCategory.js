const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');
const lazadaCategory = require('../models/lazadaCategory')

const saveAllCategory  = async (Category, idpath) =>{
  
  Category.forEach(async(item) => {
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
module.exports.getCategoryById = async (req,res) =>{
    //const categoryId = req.query.id;
    const optType = req.query.optType;
    const idpath = req.body.idpath;
    //const size = idpath.length +1 ;
    if(optType == "queryCategoryCascade" && idpath.length == 0)
    {
      try {
        const categories = await lazadaCategory.find({idpath:{ $size: 1}}, {name: 1, category_id: 1, leaf: 1, idpath:1});
        //await lazadaCategory.updateMany({"idpath.0": 4304},{$set: {"idpath.0": 4303}})
        res.send(categories);
      } catch (e) {
        res.status(500).send(e.message);
      }
    }else if( idpath.length != 0){
      try {
        const categories = await lazadaCategory.find({idpath:{$all:idpath ,$size: idpath.length+1}}, {name: 1, category_id: 1, leaf: 1, idpath:1});
    
        res.send(categories);
      } catch (e) {
        res.status(500).send(e.message);
      }
    }
    
    
};

module.exports.getAttributeByCategoryId =  async (req,res)=>{
    const categoryId = req.params.id;
    try {
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/partner/category/attribute/' + categoryId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAzMzM4NCwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.c6b8hm-BNaKfh9raMtZJaTMrmzLp8MJGOoqXnxO8Igs'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const attributes = JSON.parse(response.body)
            res.send(attributes)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.createLazadaCategory = async (req, res) => {
  const Category = req.body.data;
  try {
    
    saveAllCategory(Category, [])
  
  } catch (e) {
      res.status(500).send(Error(e));
  }
  res.send("done");
};