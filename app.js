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
    longitude: Number
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

// GET home route
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        console.log("here");
    } else {
        console.log("there");
    }
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
            res.render("home", {eventList: docs, uniqueSportList: uniqueSportList, locList: locList});
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
        console.log(user);
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
        User.register({username: req.body.registerEmail}, req.body.registerPassword, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                res.redirect("/signin");
            }
        })
    })
;


// GET add new activity page
app.get("/host", (req, res) => {
    Facility.find({}).sort('name').exec((err, docs) => {
        if (!err) {
            var locList = [];
            res.render("host", {facilityList: docs, locList: locList});
        }
    });
});

// POST new activity to mongodb
app.post("/submit", (req, res) => {
    console.log(req.body);
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
                longitude: long})

            activity.save().then(() => {res.redirect("/");});
            
        };
    });
});

// GET page for specific activity
app.get("/:activityID", (req, res) => {

    const activityID = req.params.activityID;

    Activity.findOne({_id: activityID}, (err, docs) => {
        if (!err) {
            const eventItem = docs;
            var loc = [docs.locationName, docs.latitude, docs.longitude, 0];
            var locList = [];
            locList.push(loc);
            res.render("showactivity", {eventItem: eventItem, locList: locList});        
        };
    });
});

app.listen(PORT);   

