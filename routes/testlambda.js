const getUser = require("./getuser");
const Activity = require("../models/activity");
const User = require("../models/users");
const Facility = require("../models/facility");
// Define a payload dictionary to store all docs from activity, facility and users, to be passed onto lambda function as payload!


module.exports = function(app, lambda){

                    app.get("/testlambda", (req, res) => {
                        // get users, facility and activity data to be passed as payload into lambda
                        
                        // check auth status and pass username
                        const user = getUser(req)[0];
                        const user_id = getUser(req)[1][0];

                        // If user is currently logged in, show him his recommended users.
                        if (req.isAuthenticated()) {
                            User.findOne({_id: user_id}, (usererr, userdocs) => {
                                if (!usererr) {
                                    var userLocation = userdocs.userLocation
                                    var payloaddict = {}
                                    // package as json, use AWS-SDK to send user_id ('_id') data as an event to give to lambda function 
                   
                                    // store the data for logged in user in the payloaddict
                                    payloaddict['logged_user'] = userdocs;
                                    User.find({'userLocation': userLocation}).limit(5).exec((err, manyuserdocs) => {
                                        if (!err) {
                                            manyuserdocs.push(userdocs)
                                            payloaddict['users'] = manyuserdocs;
                                            // console.log(manyuserdocs);
                                            userlist = [];
                                            manyuserdocs.forEach(elem => userlist.push(elem._id));
                                            
                                            Activity.find({'hostID': {$in: userlist}}).limit(10).exec((err, activitydocs) => {
                                                payloaddict['activity'] = activitydocs;
                                                var params = {
                                                    FunctionName: 'testlambda', /* required */
                                                
                                                    InvocationType: 'RequestResponse',
                                                    Payload: JSON.stringify(payloaddict) /* Strings will be Base-64 encoded on your behalf */,
                                                  };
                                                
                                                // Invoking the lambda function in AWS
                                                lambda.invoke(params, function(err, data) {
                                                if (err) {console.log(err, err.stack);} // an error occurred
                                                else     {
                                                    var docs = JSON.parse(data.Payload);
                                                    console.log(docs);
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
                                                                };           // successful response
                                                });

                                            });

                                            }
                                        });
                                    }
                                });                                    
                                    /*
                                    Now, we want to retrieve the users, activities and facilities data to pass to our lambda function.
                                    To this, we will use 3 nodeJS queries with callbacks, to ensure that we save each entry, before we send the json payload
                                    to lambda function to process.
                                    */
                            //         Activity.find({}).limit(5).exec((err, docs) => {
                            //             if (!err) {
                            //                 payloaddict['activity'] = docs;
                            //                 // console.log(payloaddict['activity'])
                            //                 Facility.find({}).exec((err, docs) => {
                            //                     if (!err) {
                            //                         payloaddict['facility'] = docs;
                            //                         // console.log(payloaddict['facility'])
                            //                         User.find({'userLocation': userLocation}).limit(5).exec((err, docs) => {
                            //                             if (!err) {
                            //                                 payloaddict['users'] = docs;
                            //                                 console.log(payloaddict['users'])
                                                            
                            //                                 // Define our params to be passed into lambda.invoke
                                                            // var params = {
                                                            //     FunctionName: 'testlambda2', /* required */
                                                            //     InvocationType: 'RequestResponse',
                                                            //     Payload: JSON.stringify(payloaddict) /* Strings will be Base-64 encoded on your behalf */,
                                                            //   };
                                                            
                                                            // // Invoking the lambda function in AWS
                                                            // lambda.invoke(params, function(err, data) {
                                                            // if (err) console.log(err, err.stack); // an error occurred
                                                            // else     console.log(data);           // successful response
        
                                                            // });
                            //                             }
                            //                         });
                            //                     }
                            //                 });
                            //             }
                            //         });
        
                            //     };
                            // });
                            

                            // Now, we need to render the homepage to be shwon as follows: 
                            // var sportList = [];
                            //         var locList = [];
                            //         // console.log(docs);
                            //         docs.forEach((elem) => {
                            //             sportList.push(elem.sport);
                            //             var loc = [elem.locationName, elem.latitude, elem.longitude, 0];
                            //             locList.push(loc);
                            //         });
                            //         const uniqueSportList = [...new Set(sportList)];
                            //         // render the home page view after getting lambda results
                            //         res.render("home", {eventList: docs, uniqueSportList: uniqueSportList, locList: locList, user: user});

                        } 
                        // if user is not logged in, show him the default view of activities at home page.
                        else {
                            // show whatever is already there
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
                        }
                    });
                };
