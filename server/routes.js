var passport = require('passport');

var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
};

module.exports.initialize = function(app) {
    app.get('/', function(req, res) {
        resStr = 'Home page.  User: ' + (req.user ? req.user.email : '(none)') +
            '.  Display name: ' + (req.user ? req.user.displayName : '(none)') + 
            '.  Flash message: ' + (req.flash('error') || '(none)');

        res.send(resStr);
    });

    app.get('/secured', ensureAuthenticated, function(req, res) {
        res.send('This is a secured page, user is ' + (req.user ? req.user.email: '(none)'));
    });

    app.get('/login', 
            passport.authenticate('wsfed-saml2', {
                successRedirect: '/secured',
                failureRedirect: '/', 
                failureFlash: true
            }),
            function(req, res) { res.redirect('/'); }
   );

    app.post('/login/callback', 
             passport.authenticate('wsfed-saml2', {
                 failureRedirect: '/',
                 failureFlash: true
             }),
             function(req, res) {
                 res.redirect('/');
             }
    );
};
