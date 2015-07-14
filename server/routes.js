var passport = require('passport');

var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
};

module.exports.initialize = function(app) {
    app.get('/', ensureAuthenticated, function(req, res) {
        var viewModel = {
            userName: req.user.displayName
        };
        res.render('home', viewModel);
    });

    app.get('/login', 
            passport.authenticate('wsfed-saml2', {
                successRedirect: '/',
                failureRedirect: '/failedLogin', 
                failureFlash: true
            }),
            function(req, res) { res.redirect('/'); }
   );

   app.get('/failedLogin', function(req, res) {
       var str = 'Failed to log in.  Error message: ' + (req.flash('error') || ('none'));
   });

    app.post('/login/callback', 
             passport.authenticate('wsfed-saml2', {
                 failureRedirect: '/failedLogin',
                 failureFlash: true
             }),
             function(req, res) {
                 res.redirect('/');
             }
    );
};
