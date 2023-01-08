const StoreModel = require("../model/Store.model")


const getStores = async (req, res) => {
    // const stores = await StoreModel.find()
    const stores = await StoreModel.aggregate([      
        {$sample: {size: 15}}
    ]);
    res.json({error: 0, message: "Success", stores: stores})   
}

const deleteStore = async (req, res) => {

    try {
        await StoreModel.findByIdAndDelete(req.body._id);
        res.json({error: 0, message: "Success"})
        
    } catch (error) {
        res.json({error: 1, message: "Store not found"});
        
    }

}

const searchStores = async (req, res) => {

    if(!req.body.name || req.body.name.length == 0) return res.json({error: 1, message: "Invalid", stores: []})

    const stores = await StoreModel.find().or([{name: {$regex: req.body.name, $options: 'i'}}, {description: {$regex: req.body.name, $options: 'i'}}])
    res.json({error: 0, message: "Success", stores: stores})
}


const getStoresPaginated = async (req, res) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    if (endIndex < await StoreModel.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await StoreModel.find().limit(limit).skip(startIndex).exec()
      res.json({error: 0, message: "Success", stores: results})
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
}


module.exports = {
    getStores,
    searchStores,
    deleteStore,
    getStoresPaginated
}