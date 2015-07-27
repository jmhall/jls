var passport = require('passport');

module.exports = {
    authenticate: function(req, res) {

        passport.authenticate(req.app.get('passport strategy'), {
            successRedirect: '/',
            failureRedirect: '/failedLogin',
            failureFlash: true
        })(req, res);
    },

    failedLogin: function(req, res) {
        var str = 'Failed to log in.  Error message: ' + (req.flash('error') || ('none'));
        res.send(str);
    },

};
