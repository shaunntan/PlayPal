const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String,
    userAge: Number,
    userLocation: String,
    userPreferredTime: [String],
    userPreferredDay: [String],
    favSport: [String]
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('user', userSchema);

module.exports = User;