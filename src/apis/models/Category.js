const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");




const schema = new Schema({
    category_id:{
        type: Number
    },
   var:{
       type: Boolean
   },
   name:{
       type: String
   },
   leaf:{
        type: Boolean
   },
   idpath:{
       type: Array
   },
   namepath:{
       type: Array
   }
})
module.exports = mongoose.model("Category", schema);
