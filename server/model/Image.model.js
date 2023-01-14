

const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String
});

// create the Image model
const Image = mongoose.model('Image', imageSchema);