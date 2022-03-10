const getUser = require("./getuser");
const User = require("../models/users");

module.exports = function(app, passport, ses, s3, myBucket, signedUrlExpireSeconds){
    app.route("/uploadprofilepic")
    .post((req, res) => {
        // console.log(req.body);
        const username = req.body.username;
        const firstName = req.body.registerFirstName;
        const lastName = req.body.registerLastName;
        const userAge = req.body.userAge;
        const userLocation = req.body.userLocation;
        const userPreferredTime = req.body.userPreferredTime;
        const userPreferredDay = req.body.userPreferredDay;
        const favSport = req.body.favSport;

        User.register(new User({username: username, firstName: firstName, lastName: lastName, 
                                userAge: userAge, userLocation: userLocation, userPreferredTime: userPreferredTime, 
                                userPreferredDay: userPreferredDay, favSport: favSport}), req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                // console.log(user);
                const userid = user._id;

                // Send registration email using AWS SES upon successful registration.
                const usertag = userid.toString();
                var emailparams = {
                    Destination: {
                        BccAddresses: [],
                        CcAddresses: [],
                        // ToAddresses: [username]
                        ToAddresses: ['cs5224m5@comp.nus.edu.sg'] // Account is in sandbox mode, can only send to and from verified addresses.
                    },
                    Message: {
                        Body: {
                            Html: {Charset: 'UTF-8', Data: 'Testing HTML Body.'},
                            Text: {Charset: 'UTF-8', Data: 'Testing Text Body.'},
                        },
                        Subject: {Charset: 'UTF-8', Data: 'Testing Subject.'}
                    },
                    Source: 'cs5224m5@comp.nus.edu.sg',
                    Tags: [{Name: 'registration', Value: usertag}]
                };
                ses.sendEmail(emailparams, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data);           // successful response
                  });
                
                // authenticate session and load upload profile pic page.
                passport.authenticate("local")(req, res, function(){
                    
                    const post = s3.createPresignedPost({
                        Bucket: myBucket,
                        Conditions: [
                            ['starts-with', '$key', 'profilepictures/'],
                            ['starts-with', '$success_action_redirect', 'http://localhost:4000/']
                          ],
                        Expires: signedUrlExpireSeconds
                    },(err, data) => {
                            const d = JSON.parse(JSON.stringify(data));
                            console.log(d);

                            const bucket = d.fields['bucket'];
                            const credential = d.fields['X-Amz-Credential'];
                            const algorithm = d.fields['X-Amz-Algorithm'];
                            const date = d.fields['X-Amz-Date'];
                            const policy = d.fields['Policy'];
                            const signature = d.fields['X-Amz-Signature'];
                            const redirect = d.fields['success_action_redirect'];
                            res.render("uploadpic", { bucket: bucket, userid: userid, credential: credential, date: date, policy: policy, signature: signature, algorithm: algorithm, redirect:redirect});    
            
                    });
                });
            }
        })


    
    });
};