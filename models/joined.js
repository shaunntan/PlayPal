const mongoose = require("mongoose");

const joinedSchema = new mongoose.Schema({
    eventID: String,
    userID: String,
    hostID: String,
    locationID: String,
    locationName: String,
    eventDate: Date,
    hostName: String,
    sport: String,
    latitude: Number,
    longitude: Number,
});

const Joined = mongoose.model('join', joinedSchema);

module.exports = Joined;