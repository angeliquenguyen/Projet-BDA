var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
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

module.exports = router;

function isAuthenticated (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};
