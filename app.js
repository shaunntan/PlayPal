// load environment variables
require('dotenv').config();

// use express as web app framework 
const express = require("express");
const app = express();
const PORT = 3000;
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
app.get("/signin", (req, res) => {
    res.render("signin");
});

// GET registration page needs work
app.get("/register", (req, res) => {
    res.render("register");
});

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

