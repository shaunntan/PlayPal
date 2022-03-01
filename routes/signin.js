const getUser = require("./getuser");
const User = require("../models/users");

module.exports = function(app, passport){

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
                    });
                };
