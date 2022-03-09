const Activity = require("../models/activity");
const Review = require("../models/reviews");
const getUser = require("./getuser");

module.exports = function(app){
    app.route("/leavereview/:activityID")
    .get((req,res) => {
        if (req.isAuthenticated()) {
            const user = getUser(req)[0];
            const userID = getUser(req)[1];
            const activityID = req.params.activityID;
        
            Activity.findOne({_id: activityID}, (err, docs) => {
                // console.log(docs);
                if (!err) {
                    const eventItem = docs;
        
                    var loc = [docs.locationName, docs.latitude, docs.longitude, 0];
                    var locList = [];
                    locList.push(loc);
                    res.render("leavereview", {eventItem: eventItem, locList: locList, user: user, userID: userID, activityID: activityID});        
                };
            });
        } else {
            res.redirect('/signin');
        };
    })
    .post((req,res) => {
        if (req.isAuthenticated()) {
            console.log(req.body);
            const user = getUser(req)[0];
            const userID = getUser(req)[1].toString();
            const activityID = req.params.activityID;
            const reviewerName = req.body.reviewername;

            const review = {}
            Activity.findOne({_id: activityID}, (err,docs) => {
                if (!err) {
                    const hostID = docs.hostID;
                    const reviewDate = new Date();
                    const rating = req.body.rating;
                    const reviewText = req.body.reviewtext;

                    console.log(reviewDate)
                    const review = {
                        'activityID': activityID,
                        'reviewerID': userID,
                        'reviewerName': reviewerName,
                        'date': reviewDate,
                        'rating': rating,
                        'review': reviewText
                    };

                    Review.findOne({userID: hostID}, (err, docs) => {
                        if (docs) {
                            console.log('here');
                            Review.updateOne({userID: hostID}, {$push: {reviews: review}},{upsert: true}).then((result) => {
                                // console.log(result)
                              }).catch((error) => {
                                // console.log(error)
                              });
                            res.redirect("/profile");
                        } else {
                            const newreview = new Review({
                                userID: hostID,
                                reviews: [review]
                            });
                            newreview.save().then(() => {
                                // window.alert("Review Saved!");
                                res.redirect("/profile");
                            });
                        };
                    });
                }
            });
        } else {
            res.redirect('signin');
        };
    })
    ;
};
