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

module.exports.getDistricts = async (req, res) => {
    const provinceId = req.params.provinceId
    try {
        const districts = await District.find({province_id: provinceId})

        res.status(200).send(districts)
        
    } catch (e) {
        res.status(500).send(Error(e));
    }
};

module.exports.getWards = async (req, res) => {
    const districtId = req.params.districtId
    try {
        const wards = await Ward.find({district_id: districtId})

        res.status(200).send(wards)
        
    } catch (e) {
        res.status(500).send(Error(e));
    }
};