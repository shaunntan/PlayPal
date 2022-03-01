const getUser = require("./getuser");
const User = require("../models/users");

module.exports = function(app, passport){
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
                console.log(err);
                res.redirect("/register");
            } else {
                console.log(user);
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/");
                });
                // res.redirect("/signin");
            }
        })
    })
;
};
