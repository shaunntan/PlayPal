module.exports = function getUser(req) {
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