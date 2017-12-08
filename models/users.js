var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    creationDate: { type: Date, default: Date.now },
    friends: [String]
});