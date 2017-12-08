var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    Character = require('../models/characters');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

router.route('/')
    .get(function(req, res, next) {
        Character.find({'userId' : req.cookies.userId}, function (err, characters) {
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    html: function(){
                        res.render('characters/index', {
                            "characters": characters
                        });
                    },
                    json: function(){
                        res.json(characters);
                    }
                });
            }
        });
    })
    .post(function(req, res) {
        var name = req.body.name;
        var race = req.body.race;
        var sex = req.body.sex;
        Character.create({
            name: name,
            race: race,
            sex: sex,
            level: 1,
            xp: 0,
            creationDate: Date.now(),
            userId: req.cookies.userId
        }, function (err, character) {
            if (err) {
                res.send("Fail to create character");
            } else {
                res.format({
                    html: function(){
                        res.location("characters");
                        res.redirect("/characters");
                    },
                    json: function(){
                        res.json(character);
                    }
                });
            }
        })
    });

router.get('/new', function(req, res) {
    res.render('characters/new');
});

router.param('id', function(req, res, next, id) {
    Character.findById(id, function (err, character) {
        if (err) {
            console.log(id + ' was not found');
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
            req.id = id;
            next();
        }
    });
});

router.route('/:id')
    .get(function(req, res) {
        Character.findById(req.id, function (err, character) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + character._id);
                var creationDate = character.creationDate.toISOString();
                res.format({
                    html: function(){
                        res.render('characters/show', {
                            "character": character,
                            "creationDate": creationDate.split('T')[0]
                        });
                    },
                    json: function(){
                        res.json(character);
                    }
                });
            }
        });
    });

router.route('/:id/edit')
    .get(function(req, res) {
        Character.findById(req.id, function (err, character) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + character._id);
                res.format({
                    html: function(){
                        res.render('characters/edit', {
                            "character" : character
                        });
                    },
                    json: function(){
                        res.json(character);
                    }
                });
            }
        });
    })
    .put(function(req, res) {
        var name = req.body.name;
        var sex = req.body.sex;
        Character.findById(req.id, function (err, character) {
            character.update({
                name: name,
                sex: sex
            }, function(err, characterId) {

                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    res.format({
                        html: function(){
                            res.redirect('/characters/'+character._id);
                        },
                        json: function(){
                            res.json(character);
                        }
                    });
                }
            })
        });
    })
    .delete(function (req, res){
        Character.findById(req.id, function (err, character) {
            if (err) {
                return console.error(err);
            } else {
                character.remove(function (err, character) {
                    if (err) {
                        return console.error(err);
                    } else {
                        console.log('DELETE removing ID: ' + character._id);
                        res.format({
                            html: function(){
                                res.redirect("/characters");
                            },
                            json: function(){
                                res.json({message : 'deleted',
                                    item : character
                                });
                            }
                        });
                    }
                });
            }
        });
    });

module.exports = router;
