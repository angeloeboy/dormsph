const mongoose = require('mongoose')

const User = new mongoose.Schema({
    password:{
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    verified: {
        type: Boolean,
        require: true,
        default: false
    },
    role:{
        type: String,
        require: true
    },
    stores: {
        type: Array,
    },

})

module.exports = mongoose.model('User', User)