const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    locationID: String,
    locationName: String,
    eventDate: Date,
    hostName: String,
    sport: String,
    latitude: Number,
    longitude: Number,
    hostID: String,
    teammates: [String]
});

const Activity = mongoose.model('activity', activitySchema);


module.exports = Activity;