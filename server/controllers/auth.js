var passport = require('passport');

module.exports = {
    authenticate: passport.authenticate('wsfed-saml2', {
        successRedirect: '/',
        failureRedirect: '/failedLogin',
        failureFlash: true
    }),

    failedLogin: function(req, res) {
        var str = 'Failed to log in.  Error message: ' + (req.flash('error') || ('none'));
        res.send(str);
    },

};
