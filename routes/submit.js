const getUser = require("./getuser");
const Facility = require("../models/facility");
const Activity = require("../models/activity");

module.exports = function(app){
    app.post("/submit", (req, res) => {
        // console.log(req.body);
        const locationID = req.body.locationid;
        const locationName = req.body.locationname;
        const host = req.body.hostname;
        const sport = req.body.sport;
        const eventDate = req.body.eventdate;
    
        Facility.findById(locationID, (err, doc) => {
            if (!err) {
                const lat = doc.latitude
                const long = doc.longitude
    
                const activity = new Activity({
                    locationID: locationID,
                    locationName: locationName,
                    eventDate: eventDate,
                    hostName: host,
                    sport: sport,
                    latitude: lat,
                    longitude: long,
                    hostID: req.user._id
                })
    
                activity.save().then(() => {res.redirect("/");});
                
            };
        });
    });
    
};
