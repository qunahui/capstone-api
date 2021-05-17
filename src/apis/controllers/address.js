const auth = require("../../middlewares/auth");
const Province = require("../models/province");
const District = require("../models/district");
const Ward = require("../models/ward");
const Error = require("../utils/error");
const request = require('request');
const util = require('util');
const { time } = require("console");
const rp = require('request-promise');


module.exports.getProvinces = async (req, res) => {
    try {
        const provinces = await Province.find()

        res.status(200).send(provinces)

    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.createProvince = async (req, res) => {
    const item = req.body;

    const province = new Province({
      id: item.id,
      name: item.name,
      type: item.type
    });
  
    try {
      await province.save();
      res.send(province);
    } catch (e) {
      res.status(500).send(Error(e));
    }
};
module.exports.getProvinceById = async (req, res) => {
    try {
        const province = await Province.find({id: req.params.id})

        res.status(200).send(province)

    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.updateProvince = async (req, res) => {
    const properties = Object.keys(req.body);

  
    try {
      const province = await Province.findOne({id: req.params.id});
      if (!province) {
        res.status(404).send(province);
      }
  
      properties.forEach((prop) => (province[prop] = req.body[prop]));
      
      province.save();
  
      res.send(province);
    } catch (e) {
      res.status(404).send(Error(e));
    }
};
module.exports.deleteProvince = async (req, res) => {
    try {
        const province = await Province.findOneAndDelete({id: req.params.id});
    
        if (!province) {
          return res.status(404).send();
        }
    
        res.send(province)
      } catch (e) {
        res.status(500).send(Error(e));
      }
};



module.exports.getDistrictsByProvinceId = async (req, res) => {
    const provinceId = req.params.provinceId
    try {
        const districts = await District.find({province_id: provinceId})

        res.status(200).send(districts)
        
    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.getDistricts = async (req, res) => {
    try {
        const districts = await District.find()

        res.status(200).send(districts)

    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.createDistrict = async (req, res) => {
    const item = req.body;

    const district = new District({
      id: item.id,
      name: item.name,
      type: item.type
    });
  
    try {
      await district.save();
      res.send(district);
    } catch (e) {
      res.status(500).send(Error(e));
    }
};
module.exports.getDistrictById = async (req, res) => {
    try {
        const district = await District.find({id: req.params.id})

        res.status(200).send(district)

    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.updateDistrict = async (req, res) => {
    const properties = Object.keys(req.body);

  
    try {
      const district = await District.findOne({id: req.params.id});
      if (!district) {
        res.status(404).send(district);
      }
  
      properties.forEach((prop) => (district[prop] = req.body[prop]));
      
      district.save();
  
      res.send(district);
    } catch (e) {
      res.status(404).send(Error(e));
    }
};
module.exports.deleteDistrict = async (req, res) => {
    try {
        const district = await District.findOneAndDelete({id: req.params.id});
    
        if (!district) {
          return res.status(404).send();
        }
    
        res.send(district)
      } catch (e) {
        res.status(500).send(Error(e));
      }
};



module.exports.getWardsByDistrictId = async (req, res) => {
    const districtId = req.params.districtId
    try {
        const wards = await Ward.find({district_id: districtId})

        res.status(200).send(wards)
        
    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.getWards = async (req, res) => {
    try {
        const wards = await Ward.find()

        res.status(200).send(wards)

    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.createWard = async (req, res) => {
    const item = req.body;

    const ward = new Ward({
      id: item.id,
      name: item.name,
      type: item.type
    });
  
    try {
      await ward.save();
      res.send(ward);
    } catch (e) {
      res.status(500).send(Error(e));
    }
};
module.exports.getWardById = async (req, res) => {
    try {
        const ward = await Ward.find({id: req.params.id})

        res.status(200).send(ward)

    } catch (e) {
        res.status(500).send(Error(e));
    }
};
module.exports.updateWard = async (req, res) => {
    const properties = Object.keys(req.body);

  
    try {
      const ward = await Ward.findOne({id: req.params.id});
      if (!ward) {
        res.status(404).send(ward);
      }
  
      properties.forEach((prop) => (ward[prop] = req.body[prop]));
      
      ward.save();
  
      res.send(ward);
    } catch (e) {
      res.status(404).send(Error(e));
    }
};
module.exports.deleteWard = async (req, res) => {
    try {
        const ward = await Ward.findOneAndDelete({id: req.params.id});
    
        if (!ward) {
          return res.status(404).send();
        }
    
        res.send(ward)
      } catch (e) {
        res.status(500).send(Error(e));
      }
};