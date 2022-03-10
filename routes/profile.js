const getUser = require("./getuser");
const Joined = require("../models/joined");
const Activity = require("../models/activity");
const Review = require("../models/reviews");

module.exports = function(app, s3, myBucket){
    app.get("/profile", (req,res) => {
        const user = getUser(req)[0];
        const userID = getUser(req)[1];
        if (req.isAuthenticated()) {
            var params = {Bucket: myBucket, Key: `profilepictures/${userID}.jpg`};
            var url = s3.getSignedUrl('getObject', params);
            // console.log('The URL is', url);
    
            Activity.find({hostID: userID}).sort('eventDate').exec((activityerr, activitydocs) => {
                if (!activityerr) {
                    Joined.find({userID: userID}).sort('eventDate').exec((joinederr, joineddocs) => {
                        var locList = [];
                        joineddocs.forEach((elem) => {
                            var loc = [elem.locationName, elem.latitude, elem.longitude, 0];
                            locList.push(loc);
                        });
                        Review.findOne({userID: userID}, (reviewerr, reviewdocs) => {
                            res.render("profile", {eventList: activitydocs, joinedList: joineddocs, reviews: reviewdocs, locList: locList, user: user, picUrl: url});
                        });
                    });
                };
            });
            } else {
            res.redirect("/")
        };
    });
    
    
};
