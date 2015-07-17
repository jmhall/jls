var passport = require('passport');
var authController = require('./controllers/auth');
var homeController = require('./controllers/home');
var teacherController = require('./controllers/teacher');

var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
};

module.exports.initialize = function(app) {
    app.get('/', ensureAuthenticated, homeController.home);

    app.get('/login', authController.authenticate, function(req, res) { res.redirect('/'); });

    app.get('/failedLogin', authController.failedLogin); 

    app.post('/login/callback', authController.authenticate, function(req, res) { res.redirect('/'); });

    app.all('/teacher', ensureAuthenticated);

    app.get('/teacher', teacherController.home);

};
