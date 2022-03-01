const getUser = require("./getuser");
const Activity = require("../models/activity");

module.exports = function(app){

                    app.get("/", (req, res) => {

                        // check auth status and pass username
                        const user = getUser(req)[0];

                        Activity.find({}).sort('eventDate').exec((err, docs) => {
                            if (!err) {
                                var sportList = [];
                                var locList = [];
                                // console.log(docs);
                                docs.forEach((elem) => {
                                    sportList.push(elem.sport);
                                    var loc = [elem.locationName, elem.latitude, elem.longitude, 0];
                                    locList.push(loc);
                                });
                                const uniqueSportList = [...new Set(sportList)];
                                res.render("home", {eventList: docs, uniqueSportList: uniqueSportList, locList: locList, user: user});
                            }
                        });
                    });
                };
