const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number
    });

const Facility = mongoose.model('facility', facilitySchema);
    
module.exports = Facility;