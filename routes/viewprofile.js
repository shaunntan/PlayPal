const getUser = require("./getuser");
const User = require("../models/users");
const Review = require("../models/reviews");
const Activity = require("../models/activity");
const Joined = require("../models/joined");

module.exports = function(app, s3, myBucket){
    app.get("/viewprofile/:userID", (req,res) => {
        const user = getUser(req)[0];
        // const userID = getUser(req)[1];
        // if (req.isAuthenticated()) {
            const findUser = req.params.userID;
    
            var params = {Bucket: myBucket, Key: `profilepictures/${findUser}.jpg`};
            var url = s3.getSignedUrl('getObject', params);
            // console.log('The URL is', url);
    
            User.findOne({_id: findUser}, (usererr, userdocs) => {
                if (!usererr) {
                        Review.findOne({userID: findUser}, (err, reviewdocs) => {
                            if (!err) {
                                // console.log(userdocs);
                                Activity.find({hostID: findUser}).sort('eventDate').exec((activityerr, activitydocs) => {
                                    if (!activityerr) {
                                        Joined.find({userID: findUser}).sort('eventDate').exec((joinederr, joineddocs) => {
                                            res.render("viewprofile", {foundUser: userdocs, reviews: reviewdocs, eventList: activitydocs, eventList2: joineddocs, user: user, picUrl: url});
                                        });
                                    }
                                });
                            };
                        });
                };
            });
        //     } else {
        //     res.redirect("/")
        // };
    });
};
