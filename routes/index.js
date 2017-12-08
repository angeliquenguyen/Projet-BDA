var express = require('express'),
    router = express.Router();


module.exports = function(passport){

    /* GET login page. */
    router.get('/', function(req, res) {
        res.render('index', { message: req.flash('message') });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash : true
    }));

    /* GET Registration Page */
    router.get('/signup', function(req, res){
        res.render('register',{message: req.flash('message')});
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash : true
    }));

    /* GET Home Page */
    router.get('/home', isAuthenticated, function(req, res){
        res.render('home', { user: req.user });
    });

    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

return router;
};

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};
