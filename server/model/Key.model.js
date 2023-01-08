const mongoose = require('mongoose')

const Key = new mongoose.Schema({
    key:{
        type: String,
        require: true
    },
    validity: {
        type: Number,
        require: true
    },
    used: {
        type: Boolean,
        require: true
    }

})

module.exports = mongoose.model('Key', Key)