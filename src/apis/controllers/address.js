const auth = require("../../middlewares/auth");
const Region = require("../models/region");
const Error = require("../utils/error");
const sendo = require('./sendo')
const request = require('request');

module.exports.getAllRegion = async (req, res) => {
    try {
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/address/region',
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTA5MDEzOCwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.lo4vyq0szgdZJu3ACN8ePOAE7OhLRsGlzdVhsRv_Jow'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const regions = JSON.parse(response.body)
            res.send(regions)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }
};

//đừng quan tâm
module.exports.getRegionById = async (req, res) =>{
    try {
        const regionId = req.params.id
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/address/region/' + regionId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAwMDkxNiwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.U_6WzhCsliMUVFApHqbjFF6EbDwaUxWgIDAHouZ4-j8'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const region = JSON.parse(response.body)
            res.send(region)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getAllDistrictByRegionId = async (req, res) => {
    try {
        const regionId = req.query.regionId
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/address/district?regionId=' + regionId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAwMDkxNiwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.U_6WzhCsliMUVFApHqbjFF6EbDwaUxWgIDAHouZ4-j8'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const  districts = JSON.parse(response.body)
            res.send(districts)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}
//đừng quan tâm
module.exports.getDistrictById = async (req, res) =>{
    try {
        const districtId = req.params.id
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/address/district/' + districtId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAwMDkxNiwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.U_6WzhCsliMUVFApHqbjFF6EbDwaUxWgIDAHouZ4-j8'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const district = JSON.parse(response.body)
            res.send(district)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

module.exports.getAllWardByDistrictId = async (req, res) =>{
    try {
        const districtId = req.query.districtId
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/address/ward?districtId=' + districtId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAwMDkxNiwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.U_6WzhCsliMUVFApHqbjFF6EbDwaUxWgIDAHouZ4-j8'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const  wards = JSON.parse(response.body)
            res.send(wards)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }
}

//đừng quan tâm
module.exports.getWardById = async (req, res) => {
    try {
        const wardId = req.params.id
        const options = {
            'method': 'GET',
            'url': 'https://open.sendo.vn/api/address/district/' + wardId,
            'headers': {
              'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiODM0NzMxIiwiVXNlck5hbWUiOiIiLCJTdG9yZVN0YXR1cyI6IjIiLCJTaG9wVHlwZSI6IjEiLCJTdG9yZUxldmVsIjoiMCIsImV4cCI6MTYwNTAwMDkxNiwiaXNzIjoiODM0NzMxIiwiYXVkIjoiODM0NzMxIn0.U_6WzhCsliMUVFApHqbjFF6EbDwaUxWgIDAHouZ4-j8'
            }
          };
          request(options, function (error, response) {
            //if (error) throw new Error(error);
            //console.log(response.body);
            const ward = JSON.parse(response.body)
            res.send(ward)
          });
    } catch (e) {
        res.status(500).send(Error(e));
    }

}


module.exports.createRegion = async (req, res) => {
  const item = req.body;

  const region = new Region({
   id: item.id,
   name: item.name
  });

  try {
    await region.save();
    res.send(region);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.createDistrict = async (req, res) => {
  const item = req.body;

  const region = new Region({
   id: item.id,
   name: item.name
  });

  try {
    await region.save();
    res.send(region);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};