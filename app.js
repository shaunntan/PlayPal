// load environment variables
require('dotenv').config();

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
const passportLocalMongoose = require("passport-local-mongoose");
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('user', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create activity schema
const activitySchema = new mongoose.Schema({
    locationID: String,
    locationName: String,
    eventDate: Date,
    host: String,
    sport: String,
    latitude: Number,
    longitude: Number,
    owner: String,
    teammates: [String]
});

const joinedSchema = new mongoose.Schema({
    eventID: String,
    userID: String,
    locationID: String,
    locationName: String,
    eventDate: Date,
    host: String,
    sport: String,
    latitude: Number,
    longitude: Number,
});

//create facility schema
const facilitySchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number
    });

// create mongoose models
const Activity = mongoose.model('activity', activitySchema);
const Facility = mongoose.model('facility', facilitySchema);
const Joined = mongoose.model('join', joinedSchema);

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
        const username = req.body.registerEmail
        const firstName = req.body.registerFirstName;
        const lastName = req.body.registerLastName;
        User.register(new User({username: username, firstName: firstName, lastName: lastName}), req.body.registerPassword, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                console.log(user);

                res.redirect("/signin");
            }
        })
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
                host: host,
                sport: sport,
                latitude: lat,
                longitude: long,
                owner: req.user._id
            })

            activity.save().then(() => {res.redirect("/");});
            
        };
    });
});

app.get("/profile", (req,res) => {
    const user = getUser(req)[0];
    const userID = getUser(req)[1];
    if (req.isAuthenticated()) {
        Activity.find({owner: userID}).sort('eventDate').exec((err, docs) => {
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


// GET page for specific activity
app.get("/:activityID", (req, res) => {
    const user = getUser(req)[0];
    const userID = getUser(req)[1];
    const activityID = req.params.activityID;

    Activity.findOne({_id: activityID}, (err, docs) => {
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
            locationID: docs.locationID,
            locationName: docs.locationName,
            eventDate: docs.eventDate,
            host: docs.host,
            sport: docs.sport,
            latitude: docs.latitude,
            longitude: docs.longitude,
        });
        joining.save().then(() => {res.redirect("/profile");});

    });
});


app.listen(PORT);   

