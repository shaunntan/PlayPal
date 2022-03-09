const getUser = require("./getuser");
const Activity = require("../models/activity");
const Joined = require("../models/joined"); 

module.exports = function(app){
    app.post("/jointeam", (req,res) => {
        if (req.isAuthenticated()) {
            const activityID = req.body.activityid;
            const userID = req.body.userid;
            // console.log(activityID);
            // console.log(userID);
            Activity.updateOne({_id: activityID}, {$addToSet: {'teammates': userID}});
            Activity.findOne({_id: activityID}, (err, docs) => {
                const joining = new Joined({
                    eventID: activityID,
                    userID: userID,
                    hostID: docs.hostID,
                    locationID: docs.locationID,
                    locationName: docs.locationName,
                    eventDate: docs.eventDate,
                    hostName: docs.hostName,
                    sport: docs.sport,
                    latitude: docs.latitude,
                    longitude: docs.longitude,
                });
                joining.save().then(() => {res.redirect("/profile");});
    
            });
        } else {
            res.redirect('/signin');
        }
    });
};
