const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const User = new mongoose.Schema({
    password:{
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    name: {
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
    contact: {
        type: String,
        require: true
    },
    dorms: [{ type: ObjectId, ref: 'Dorm' }],


})

module.exports = mongoose.model('User', User)