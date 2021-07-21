const Error = require("../utils/error");
const SendoCategory = require("../models/sendoCategory")




module.exports.getSendoListCategory = async (req, res) => {
    const idpath = req.query.idpath ? req.query.idpath.map(i => parseInt(i)) : [];
    let query = {}, projection = { name: 1, category_id: 1, leaf: 1, idpath: 1, namepath: 1 }
    if (idpath.length == 0) {
        query = { idpath: { $size: 1 } }
    } else if (idpath.length != 0) {
        query = { idpath: { $all: idpath, $size: idpath.length + 1 } }
    }
    try {
        const categories = await SendoCategory.find(query, projection);
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send(e.message);
    }
};

module.exports.searchSendoCategory = async (req, res) => {
    const search = req.query.search
    try {
        const categories = await SendoCategory.fuzzySearch({ query: search, minSize: 3 }).find({ leaf: true }).limit(10)
        res.status(200).send(categories);
    } catch (e) {
        res.status(500).send(e.message);
    }

};

module.exports.getSuggestCategory = async (req, res) => {
    try {
        const result = await SendoCategory.fuzzySearch(req.body.name).findOne({ leaf: true })

        res.status(200).send(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).send(Error({ message: 'Có gì đó sai sai' }))
    }
}