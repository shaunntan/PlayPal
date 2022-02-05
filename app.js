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
  
const Activity = mongoose.model('activity', activitySchema);

var testlist = [
    {
        "id": "abc",
        "location": "NUS",
        "host": "Shaunn",
        "sport": "Soccer"
    },
    {
        "id": "def",
        "location": "NUS",
        "host": "Gary",
        "sport": "Basketball"
    },
    {
        "id": "ghj",
        "location": "NUS",
        "host": "Bill",
        "sport": "Golf"
    }] ;

app.get("/", (req, res) => {

    Activity.find({}, (err, docs) => {
        if (!err) {
            res.render("home", {eventList: docs});
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
    res.render("host");
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


