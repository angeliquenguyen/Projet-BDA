var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var passport = require('passport');
var initPassport = require('./passport/init');

var routes = require('./routes/index');
var characters = require('./routes/characters');
var friends = require('./routes/friends');

var database = require('./models/database');


//EXPRESS
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(session({secret: 'roly', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

//FLASH
var flash = require('connect-flash');
app.use(flash());

//ROUTES
app.use('/', routes(passport));
app.use('/characters', characters);
app.use('/friends', friends);

initPassport(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;
