const Province = require("../models/province");
const District = require("../models/district");
const Ward = require("../models/ward");
const Error = require("../utils/error");

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
  try {
    await new Province({
      id: item.id,
      name: item.name,
      type: item.type
    }).save();
    res.sendStatus(200);
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
    const item = req.body // object update
    try {
      const province = await Province.findOneAndUpdate({id: req.params.id},{...item},{returnOriginal: false});
      if (!province) {
        res.sendStatus(404);
      }
      res.status(200).send(province);
    } catch (e) {
      res.status(404).send(Error(e));
    }
};
module.exports.deleteProvince = async (req, res) => {
  try {
    const province = await Province.findOneAndDelete({id: req.params.id});
    if (!province) {
      return res.sendStatus(404);
    }
    res.sendStatus(200)
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
  try {
    await new District({
      id: item.id,
      name: item.name,
      type: item.type
    }).save();
    res.sendStatus(200);
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
  const item = req.body // object update
  try {
    const district = await District.findOneAndUpdate({id: req.params.id},{...item},{returnOriginal: false});
    if (!district) {
      res.sendStatus(404);
    }
    res.status(200).send(district);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};
module.exports.deleteDistrict = async (req, res) => {
  try {
    const district = await District.findOneAndDelete({id: req.params.id});
    if (!district) {
      return res.sendStatus(404);
    }
    res.status(200).send(district)
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
  try {
    await new Ward({
      id: item.id,
      name: item.name,
      type: item.type
    }).save();
    res.sendStatus(200);
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
  const item = req.body
  try {
    const ward = await Ward.findOneAndUpdate({id: req.params.id},{...item},{returnOriginal: false});
    if (!ward) {
      res.sendStatus(404);
    }
    res.status(200).send(ward);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};
module.exports.deleteWard = async (req, res) => {
  try {
    const ward = await Ward.findOneAndDelete({id: req.params.id});
    if (!ward) {
      return res.sendStatus(404);
    }
    res.status(200).send(ward)
  } catch (e) {
    res.status(500).send(Error(e));
  }
};