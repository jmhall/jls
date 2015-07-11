var passport = require('passport');
var wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;
var util = require('util');
var User = require('../models/user');

module.exports = function(app) {
    var wsfedRealm = process.env.WSFED_REALM || 'https://JacobsLadder891.onmicrosoft.com/activitytracking_local';
    var wsfedMetadata = process.env.WSFED_METADATA || 'https://login.microsoftonline.com/8fe02236-b1e3-4544-b615-a1edb2dc4b1a/federationmetadata/2007-06/federationmetadata.xml';
    var wsfedLogoutUrl = process.env.WSFED_LOGOUTURL || util.format('http://localhost:%s/logout', app.get('port'));

    var passportConfig = {
        realm: wsfedRealm,
        identityMetadata: wsfedMetadata,
        logoutUrl: wsfedLogoutUrl
    };

    var wsfedStrategy = new wsfedsaml2(passportConfig, function(profile, done) {
        if (!profile.email) {
            return done(new Error("No email found"), null);
        }

        User.findOne({'azureId': profile.id }, function(err, user) {
            if (err) 
                return done(err);
            if (!user) 
                return done(null, false, { message: 'Unregistered user' });
            return done(null, user);
        });
   });

    passport.use(wsfedStrategy);

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

};
