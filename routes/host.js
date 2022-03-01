const getUser = require("./getuser");
const Facility = require("../models/facility");

module.exports = function(app){
    app.get("/host", (req, res) => {
        if (req.isAuthenticated()) {
            const user = getUser(req)[0];
    
            Facility.find({}).sort('name').exec((err, docs) => {
                if (!err) {
                    var locList = [];
                    res.render("host", {facilityList: docs, locList: locList, user: user});
                }
            });
        } else {
            res.redirect("/signin");
        }
    });
};
