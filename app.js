require('dotenv').config();

const express = require("express");
const app = express();
const PORT = 3000;
app.use(express.static("public"));

const ejs = require("ejs");
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const API_KEY = process.env.API_KEY;

const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://shaunntan:${process.env.MONGOPASS}@cluster0.r0vqb.mongodb.net/playpalDB?retryWrites=true&w=majority`);

const activitySchema = new mongoose.Schema({
    location: String,
    host: String,
    sport: String
  });

const facilitySchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number
    });
  
const Activity = mongoose.model('activity', activitySchema);
const Facility = mongoose.model('facility', facilitySchema);

app.get("/", (req, res) => {

    Activity.find({}, (err, docs) => {
        if (!err) {
            var sportList = [];
            docs.forEach((elem) => {
                sportList.push(elem.sport)
            })
            const uniqueSportList = [...new Set(sportList)];
            res.render("home", {eventList: docs, uniqueSportList: uniqueSportList});
        }
    });
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/host", (req, res) => {

    Facility.find({}).sort('name').exec((err, docs) => {
        if (!err) {
            res.render("host", {facilityList: docs});
        }
    });
});

app.post("/submit", (req, res) => {
    console.log(req.body);
    const location = req.body.location;
    const host = req.body.hostname;
    const sport = req.body.sport;

    const activity = new Activity({
        location: location,
        host: host,
        sport: sport,
    });

    activity.save();
    res.redirect("/");

});

app.get("/:activityID", (req, res) => {

    const activityID = req.params.activityID;

    Activity.findOne({_id: activityID}, (err, docs) => {
        if (!err) {
            const eventItem = docs;
            res.render("showactivity", {eventItem: eventItem});        
        };
    });
});

app.listen(PORT);   


