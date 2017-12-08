var mongoose = require('mongoose');

module.exports = mongoose.model('Character', {
    name: String,
    race: String,
    sex: String,
    level: { type: Number, default: 1},
    xp: { type: Number, default: 0},
    creationDate: { type: Date, default: Date.now },
    userId: String
});