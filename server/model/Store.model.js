const mongoose = require('mongoose')

const Store = new mongoose.Schema({
    owner:{
        type: String,
        required: true
    },
    name:{
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    bannerimg: {
        type: String,
        require: true
    },
    pfpimg: {
        type: String,
        require: true
    },
    invitelink: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    datestarted: {
        type: Date,
        require: true
    },
    expiration: {
        type: Date,
        require: true
    },
    valid: {
        type: Boolean,
    },
    color: {
        type: String,
        require: true
    },
    textcolor: {
        type: String,
        require: true
    },
    expireAt: {
        type: Date,
        required: true
    }


})

Store.index({ expireAt: 1 }, { expireAfterSeconds : 0 });
module.exports = mongoose.model('Store', Store)