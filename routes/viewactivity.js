const getUser = require("./getuser");
const Activity = require("../models/activity");

module.exports = function(app){
    app.get("/activity/:activityID", (req, res) => {
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
                res.render("showactivity", {eventItem: eventItem, locList: locList, user: user, userID: userID, activityID: activityID});        
            };
        });
    });
};
