// load environment variables
require('dotenv').config();

// AWS
const AWS = require("aws-sdk");
const S3 = require('aws-sdk/clients/s3');
AWS.config.update({ 
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
    region: 'ap-southeast-1',
    signatureVersion: 'v4'
});
const ses = new AWS.SES({apiVersion: '2010-12-01'});
const s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' });
const myBucket = 'cs5224-playpal';
const signedUrlExpireSeconds = 60;

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
const getUser = require("./routes/getuser");

// routes
require('./routes/home')(app);
require('./routes/signin')(app, passport);
require('./routes/logout')(app);
require('./routes/register')(app, passport);
require('./routes/uploadprofilepic')(app, passport, ses, s3, myBucket);
require('./routes/host')(app);
require('./routes/submit')(app);
require('./routes/profile')(app, s3, myBucket);
require('./routes/viewprofile')(app, s3, myBucket);
require('./routes/viewactivity')(app);
require('./routes/jointeam')(app);
require('./routes/leavereview')(app);

app.listen(PORT, () => {
});   

