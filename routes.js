var Router = require('named-routes');

var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
};



module.exports.initialize = function(app) {
    var router = new Router();
    router.extendExpress(app);
    router.registerAppHelpers(app);

    app.get('/', 'home', function(req, res) {
        res.send('This is the home page, user is ' + (req.user || '(none)')); 
    });

    app.get('/login', 'login', function(req, res) {
        res.send('This is the login page');
    });
};
