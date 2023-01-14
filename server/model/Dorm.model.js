const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const Dorm = new mongoose.Schema({
    owner:{
        type: String,
        required: true
    },
    ownerId: {
        type: ObjectId, 
        ref: 'User'
    },
    name:{
        type: String,
        require: true
    },
    province: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true

    },
    barangay: {
        type: String,
        require: true
    },

    description: {
        type: String,
        require: true
    },
    dateposted: {
        type: Date,
        require: true
    },
    images:{
        type: Array,
    },
    price: {
        type: String,
    },
    address: {
        type: String,
    },
    tenants: {
        type: Number,
    },
    ameneties: {
        type: String
    },
    landmark: {
        type: String
    }
})

module.exports = mongoose.model('Dorm', Dorm)