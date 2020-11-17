const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');

module.exports.getCategoryById = async (req,res) =>{
    const categoryId = req.params.id;
    try {
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/partner/category/' + categoryId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAzMzM4NCwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.c6b8hm-BNaKfh9raMtZJaTMrmzLp8MJGOoqXnxO8Igs'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const categorys = JSON.parse(response.body)
            res.send(categorys)
          });
    } catch (e) {
        res.status(500).send(Error(e));
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