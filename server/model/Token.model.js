const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Token = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        require: true
    },
    uniqueString: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 
    }

})

module.exports = mongoose.model('Token', Token)