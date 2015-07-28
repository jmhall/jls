var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var homeController = require('./controllers/home');
var teacherController = require('./controllers/teacher');
var passport = require('passport');

module.exports.initialize = function(app, configureAuthRoutes) {

    configureAuthRoutes(app);

    app.get('/loggedOut', function(req, res) {
        res.send('Logged out.');
    });

    app.get('/failed', function(req, res) {
        res.send('Failed login: ' + req.flash('error'));
    });

    app.use('/', ensureLoggedIn('/login'));
    app.get('/', homeController.home);



    // Experiment
    // Authentication routes configured in configPassport
    //configureAuthRoutes(app);
    //app.get('/login', authController.authenticate, function(req, res) { res.redirect('/'); });
    //app.get('/failedLogin', authController.failedLogin); 
    //app.post('/login/callback', authController.authenticate, function(req, res) { res.redirect('/'); });


    // Teacher routes
    //app.all('/teacher', ensureLoggedIn('/login'));
    //app.get('/teacher', teacherController.home);
    //app.get('/teacher/student/:studentId', teacherController.studentHome);
};
