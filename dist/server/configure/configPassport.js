var passport = require('passport');
var wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;
var LocalStrategy = require('passport-local');
var util = require('util');
var User = require('../models').User;

var DEFAULT_STRATEGY = 'wsfed-saml2';

module.exports = function(app) {
    var strategyName = process.env.PASSPORT_STRATEGY || DEFAULT_STRATEGY;

    app.set('passport strategy', strategyName);

    if (strategyName !== DEFAULT_STRATEGY) 
        console.warn('Non-default passport strategy in use: %s', strategyName);

    passportStrategy = null;
    if (strategyName === DEFAULT_STRATEGY)
        passportStrategy = configureDefaultStrategy(app);
    else if (strategyName === 'local')
        passportStrategy = configureLocalStrategy(app);
    else
        console.error('Unrecognized passport strategy');
    
    passport.use(passportStrategy);

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function(user) {
            done(null, user);
        }, function(err) {
            done(err, null);
        });
    });

};

function configureLocalStrategy() { 
    var localStrategy = new LocalStrategy(
        function(username, password, done) {
            done(new Error('under implementation'), false);
        }
    );

    return localStrategy;
}

function configureDefaultStrategy(app) {
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
            if (!user) 
                return done(null, false, { message: 'Unregistered user' });
            return done(null, user);
        }, function(err) {
            return done(err);
        });
   });

   return wsfedStrategy;
}
