const getUser = require("./getuser");
const Activity = require("../models/activity");
const Users = require("../models/users");
const Facility = require("../models/facility");

module.exports = function(app, lambda){

    app.get("/testlambda", (req, res) => {

            var payloaddict = {};

            Activity.find({}).exec((err, docs) => {
                if (!err) {
                    payloaddict['activity'] = docs;
                    // console.log(docs)
                    // console.log(payloaddict['activity'])
                    Facility.find({}).exec((err, docs) => {
                        if (!err) {
                            payloaddict['facility'] = docs;
                            // console.log(payloaddict['facility'])
                            Users.find({}).exec((err, docs) => {
                                if (!err) {
                                    payloaddict['users'] = docs;
                                    // console.log(payloaddict['users'])
                                    // console.log(payloaddict['facility']);

                                    var params = {
                                        FunctionName: 'testlambda', /* required */
                                        InvocationType: 'RequestResponse',
                                        Payload: JSON.stringify(payloaddict) /* Strings will be Base-64 encoded on your behalf */,
                                      };

                                    lambda.invoke(params, function(err, data) {
                                    if (err) console.log(err, err.stack); // an error occurred
                                    else     console.log(data);           // successful response
                                    });
                                }
                            });
                        }
                    });
                }
            });
            
    })};
