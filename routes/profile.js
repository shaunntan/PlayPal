const getUser = require("./getuser");
const Joined = require("../models/joined");
const Activity = require("../models/activity");

module.exports = function(app, s3, myBucket){
    app.get("/profile", (req,res) => {
        const user = getUser(req)[0];
        const userID = getUser(req)[1];
        if (req.isAuthenticated()) {
            var params = {Bucket: myBucket, Key: `profilepictures/${userID}.jpg`};
            var url = s3.getSignedUrl('getObject', params);
            // console.log('The URL is', url);
    
            Activity.find({hostID: userID}).sort('eventDate').exec((err, docs) => {
                if (!err) {
                    Joined.find({userID: userID}).sort('eventDate').exec((err, docs_) => {
                        var locList = [];
                        docs.forEach((elem) => {
                            var loc = [elem.locationName, elem.latitude, elem.longitude, 0];
                            locList.push(loc);
                        });
                        res.render("profile", {eventList: docs, joinedList: docs_, locList: locList, user: user, picUrl: url});
                    });
                };
            });
            } else {
            res.redirect("/")
        };
    });
    
    
};
