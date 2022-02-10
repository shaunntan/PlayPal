// load environment variables
require('dotenv').config();
const AWS = require("aws-sdk");
const S3 = require('aws-sdk/clients/s3');

// use express as web app framework 
const express = require("express");
const app = express();
const PORT = 4000;
app.use(express.static("public"));

// use ejs for templating
const ejs = require("ejs");
app.set('view engine', 'ejs');

// use body-parser to parse body of POST req
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// mongoose for mongodb
const API_KEY = process.env.API_KEY;
const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://shaunntan:${process.env.MONGOPASS}@cluster0.r0vqb.mongodb.net/playpalDB?retryWrites=true&w=majority`);
// mongoose.connect("mongodb://localhost:27017/playpalDB");

// authentication
const session = require("express-session");
const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const sessionsecret = process.env.SESSIONSECRET;
app.use(session({
    secret: sessionsecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/users");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create mongoose models
const Activity = require("./models/activity");
const Joined = require("./models/joined");
const Facility = require("./models/facility");

function getUser(req) {
    var user = []; 
    var id = [];  
    if (req.isAuthenticated()) {
        const name = [req.user.firstName, req.user.lastName].join(' ');
        user.push(name);
        id.push(req.user._id);
        // console.log(id);
    };
    return [user, id];
};


// GET home route
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

// GET signin page needs work
app.route("/signin")
    .get((req, res) => {
        res.render("signin");
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })
        // console.log(user);
        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/");
                });
            }

        });
    })    
    ;

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// GET registration page needs work
app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        console.log(req.body);
        const username = req.body.username;
        const firstName = req.body.registerFirstName;
        const lastName = req.body.registerLastName;
        User.register(new User({username: username, firstName: firstName, lastName: lastName}), req.body.password, (err, user) => {
            if (err) {
                // console.log(err);
                res.redirect("/register");
            } else {
                // console.log(user);
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/");
                });
                // res.redirect("/signin");
            }
        })
    })
;

app.route("/uploadprofilepic")
    .get((req, res) => {
        
        AWS.config.update({ 
            accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
            secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
            region: 'ap-southeast-1',
            signatureVersion: 'v4'
        });
    
        const s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' });
        const myBucket = 'shaunntestbucket';
        // const myKey = ':DDDDDD'
        const signedUrlExpireSeconds = 60 * 5;
    
        // const url = s3.getSignedUrl('putObject', {
        //     Bucket: myBucket,
        //     Key: "profilepictures/cat.jpg",
        //     // ContentType: 'image/jpeg',
        //     Expires: signedUrlExpireSeconds
        // });

        const post = s3.createPresignedPost({
            Bucket: myBucket,
            // Key: "profilepictures/cat.jpg",
            // ContentType: 'image/jpeg',
            Conditions: [
                ['starts-with', '$key', 'profilepictures/']
              ],
            Expires: signedUrlExpireSeconds
        },(err, data) => {
                const d = JSON.parse(JSON.stringify(data));
                console.log(d);

                const credential = d.fields['X-Amz-Credential'];
                const algorithm = d.fields['X-Amz-Algorithm'];
                const date = d.fields['X-Amz-Date'];
                const policy = d.fields['Policy'];
                const signature = d.fields['X-Amz-Signature'];
                res.render("uploadpic", { credential: credential, date: date, policy: policy, signature: signature, algorithm: algorithm});    

            // const urlParams = new URLSearchParams(url);
            // const credential = d.fields['X-Amz-Credential'];
            // const date = urlParams.get('X-Amz-Date');
            // const expires = urlParams.get('X-Amz-Expires');
            // const signature = urlParams.get('X-Amz-Signature');
            // const signedHeaders = urlParams.get('X-Amz-SignedHeaders');
            // console.log(urlParams)
            // console.log(a);
            // for (const [k,v] of urlParams) {console.log(k); console.log(v)};
        });
    
    })
    .post((req, res) => {
        console.log(req.body);
    })
;

// GET add new activity page
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

// POST new activity to mongodb
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

app.get("/profile", (req,res) => {
    const user = getUser(req)[0];
    const userID = getUser(req)[1];
    if (req.isAuthenticated()) {
        Activity.find({hostID: userID}).sort('eventDate').exec((err, docs) => {
            if (!err) {
                Joined.find({userID: userID}).sort('eventDate').exec((err, docs_) => {
                    var locList = [];
                    docs.forEach((elem) => {
                        var loc = [elem.locationName, elem.latitude, elem.longitude, 0];
                        locList.push(loc);
                    });
                    res.render("profile", {eventList: docs, joinedList: docs_, locList: locList, user: user});
                });
            };
        });
        } else {
        res.redirect("/")
    };
});

app.get("/viewprofile/:userID", (req,res) => {
    const user = getUser(req)[0];
    // const userID = getUser(req)[1];
    // if (req.isAuthenticated()) {
        const findUser = req.params.userID;

        User.findOne({_id: findUser}, (err, docs) => {
            if (!err) {
                    console.log(docs);
                    res.render("viewprofile", {foundUser: docs, user: user});
            };
        });
    //     } else {
    //     res.redirect("/")
    // };
});

// GET page for specific activity
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

// POST join team!
app.post("/jointeam", (req,res) => {
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
});



app.listen(PORT, () => {
//     const utf8 = require("utf8");
//     const base64 = require("base-64");

// var policyString = { "expiration": "2015-12-30T12:00:00.000Z",
// "conditions": [
//   {"bucket": "sigv4examplebucket"},
//   ["starts-with", "$key", "user/user1/"],
//   {"acl": "public-read"},
//   {"success_action_redirect": "http://sigv4examplebucket.s3.amazonaws.com/successful_upload.html"},
//   ["starts-with", "$Content-Type", "image/"],
//   {"x-amz-meta-uuid": "14365123651274"},
//   {"x-amz-server-side-encryption": "AES256"},
//   ["starts-with", "$x-amz-meta-tag", ""],

//   {"x-amz-credential": "AKIAIOSFODNN7EXAMPLE/20151229/us-east-1/s3/aws4_request"},
//   {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
//   {"x-amz-date": "20151229T000000Z" }
// ]
// }
// var policyBytes = utf8.encode(policyString);
// var stringToSign = base64.encode(policyBytes);
// console.log(policyBytes);

// var b = new Buffer(policyString, 'base64')
// var s = b.toString();
// console.log(s);
});   

