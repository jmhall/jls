var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var homeController = require('./controllers/home');
var teacherController = require('./controllers/teacher');
var api = require('./api');

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


    // Teacher routes
    app.get('/teacher', teacherController.home);
    app.get('/teacher/student/:studentId', teacherController.studentHome);
    app.get('/teacher/student/:studentId/activity/:activityId', teacherController.studentIndividualActivity);

    // API
    app.get('/api/student-activities', api.studentActivities);
};
