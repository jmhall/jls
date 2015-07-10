var passport = require('passport');
var wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;
var util = require('util');

module.exports = function(app) {
    var wsfedRealm = process.env.WSFED_REALM || 'https://JacobsLadder891.onmicrosoft.com/activitytracking_local';
    var wsfedMetadata = process.env.WSFED_METADATA || 'https://login.microsoftonline.com/8fe02236-b1e3-4544-b615-a1edb2dc4b1a/federationmetadata/2007-06/federationmetadata.xml';
    var wsfedLogoutUrl = process.env.WSFED_LOGOUTURL || util.format('http://localhost:%s/logout', app.get('port'));

    var passportConfig = {
        realm: wsfedRealm,
        identityMetadata: wsfedMetadata,
        logoutUrl: wsfedLogoutUrl
    };

    var users = [];
    var findByEmail = function(email, fn) {
        for (var i = 0, len = users.length; i < len; i++) {
            var user = users[i];
            if (user.email === email) {
                return fn(null, user);
            }
        }
        return fn(null, null);
    };

    var wsfedStrategy = new wsfedsaml2(passportConfig, function(profile, done) {
        if (!profile.email) {
            return done(new Error("No email found"), null);
        }

        process.nextTick(function() {
            findByEmail(profile.email, function(err, user) {
                if (err) 
                    return done(err);
                // Auto-register
                if (!user) {
                    users.push(profile);
                    return done(null, profile);
                }

                return done(null, user);
            });
        });
    });

    passport.use(wsfedStrategy);

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(id, done) {
        findByEmail(id, function(err, user) {
            done(err, user);
        });
    });

};
