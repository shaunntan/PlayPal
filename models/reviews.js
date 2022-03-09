const mongoose = require("mongoose");
const review = new mongoose.Schema({
    activityID: String,
    reviewerID: String,
    reviewerName: String,
    date: Date,
    rating: Number,
    review: String
});
var reviewsSchema = new mongoose.Schema({
    userID: String,
    reviews: [review]
});

const Review = mongoose.model('review', reviewsSchema);
    
module.exports = Review;