var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    Character = require('../models/characters'),
    User = require('../models/users');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

router.all('*', isAuthenticated);

router.route('/')
    .get(function(req, res, next) {
        User.findById(req.cookies.userId, function (err, user) {
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    html: function(){
                        res.render('friends', {
                            "friends": user.friends
                        });
                    },
                    json: function(){
                        res.json(user.friends);
                    }
                });
            }
        });
    })
    .put(function(req, res) {
        var friendName = req.body.friendName;
        User.findById(req.cookies.userId, function (err, user) {
            if (err) {
                res.render('friends', {
                    "friends": user.friends
                });
            } else {
                user.update(
                    { $push: {friends: friendName}}, function(err, friend) {
                        if (err) {
                            res.send("There was a problem updating the information to the database: " + err);
                        } else {
                            res.format({
                                html: function(){
                                    res.redirect('/friends');
                                },
                                json: function(){
                                    res.json(user);
                                }
                            });
                        }
                })
            }
        });
    });

router.param('username', function(req, res, next, username) {
    User.findOne({'username': username}, function (err, user) {
        if (err) {
            console.log(username + ' was not found');
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
        } else {
            req.username = username;
            next();
        }
    });
});

router.route('/:username/profile')
    .get(function (req, res){
        User.findOne({'username': req.username}, function (err, user) {
            if (err) {
                console.log(username + ' was not found');
                res.status(404);
                var err = new Error('Not Found');
                err.status = 404;
                res.format({
                    html: function(){
                        next(err);
                    },
                    json: function(){
                        res.json({message : err.status  + ' ' + err});
                    }
                });
            } else {
                Character.find({'userId': user._id}, function (err, characters) {
                    if (err) {
                        return console.error(err);
                    } else {
                        res.render("profile", {
                            user: user,
                            characters: characters
                        });
                    }
                });
            }
        });
    });


router.route('/:username/delete')
    .delete(function (req, res){
        User.findById(req.cookies.userId, function (err, user) {
            if (err) {
                return console.error(err);
            } else {
                user.update({ $pull: {friends: req.username}}, function (err, user) {
                    if (err) {
                        return console.error(err);
                    } else {
                        res.redirect("/friends");
                    }
                });
            }
        });
    });

router.route('/search')
    .get(function(req, res) {
    var regex = new RegExp(req.query["term"], 'i');
    var query = User.find({$and: [
            {username: regex},{
            _id: {$ne: req.cookies.userId}}
        ]
    }, { 'username': 1 }).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);

    // Execute query in a callback and return users list
    query.exec(function(err, users) {
        if (!err) {
            var result = buildResultSet(users);
            res.send(result, {
                'Content-Type': 'application/json'
            }, 200);
        } else {
            res.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
    });
});

module.exports = router;

function isAuthenticated (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

function buildResultSet (docs) {
    var result = [];
    for(var object in docs){
        result.push(docs[object]);
    }
    return result;
}
