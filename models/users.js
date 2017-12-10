var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    username: {type: String, index: { unique: true }},
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    creationDate: { type: Date, default: Date.now },
    friends: [String]
});