var passport = require('passport');
var configPassport = require('./configPassport');
var wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;
var User = require('../models').User;
var util = require('util');

module.exports = {
    configureRoutes: function(app) {
        app.get('/login', passport.authenticate('wsfed-saml2', configPassport.authOptions));

        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/loggedOut');
        });

        app.post('/login/callback', passport.authenticate('wsfed-saml2', configPassport.authOptions));
    },

    configurePassport: function(app) {

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

            User.findOne({ where: { azureId: profile.id }}).then(function(user) {
                if (!user) {
                    console.error('Failed to return user for azure ID %s', profile.id);
                    return done(null, false, { message: 'Unregistered user' });
                }
                if (!user.active) {
                    console.error('Attempt to login for inactive user ID %s', profile.id);
                    return done(null, false, { message: 'Inactive user' });
                }
                return done(null, user);
            }, function(err) {
                return done(err);
            });
        });

        passport.use(wsfedStrategy);

        passport.serializeUser(configPassport.serializeUser);
        passport.deserializeUser(configPassport.deserializeUser);
    }
};
