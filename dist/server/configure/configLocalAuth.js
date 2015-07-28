var passport = require('passport');
var configPassport = require('./configPassport');
var LocalStrategy = require('passport-local');

module.exports = {
    configureRoutes: function(app) {
        app.get('/login', passport.authenticate('local', configPassport.authOptions));

        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/loggedOut');
        });

        app.post('/login/callback', passport.authenticate('local', configPassport.authOptions));
    },

    configurePassport: function(app) {
        var localStrategy = new LocalStrategy(
            function(username, password, done) {
                done(new Error('under implementation'), false);
            }
        );

        passport.use(localStrategy);

        passport.serializeUser(configPassport.serializeUser);
        passport.deserializeUser(configPassport.deserializeUser);
    }
};
