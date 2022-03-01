const getUser = require("./getuser");
const User = require("../models/users");

module.exports = function(app, s3, myBucket){
    app.get("/viewprofile/:userID", (req,res) => {
        const user = getUser(req)[0];
        // const userID = getUser(req)[1];
        // if (req.isAuthenticated()) {
            const findUser = req.params.userID;
    
            var params = {Bucket: myBucket, Key: `profilepictures/${findUser}.jpg`};
            var url = s3.getSignedUrl('getObject', params);
            // console.log('The URL is', url);
    
            User.findOne({_id: findUser}, (err, docs) => {
                if (!err) {
                        console.log(docs);
                        res.render("viewprofile", {foundUser: docs, user: user, picUrl: url});
                };
            });
        //     } else {
        //     res.redirect("/")
        // };
    });
};
