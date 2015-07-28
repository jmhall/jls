var passport = require('passport');
var User = require('../models').User;

module.exports = {
    serializeUser:  function(user, done) {
        done(null, user.id);
    },

    deserializeUser:  function(userId, done) {
        User.findOne({ where: { id: userId, active: true } }).then(function(user) {
            done(null, user);
        }, function(err) {
            done(err);
        });
    },

    authOptions:  { 
        successReturnToOrRedirect: '/', 
        failureRedirect: '/failed', 
        failureFlash: true 
    }
};
