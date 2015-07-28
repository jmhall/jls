var path = require('path');
var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var multer = require('multer');
var routes = require('../routes');
var flash = require('connect-flash');
var configPassport = require('./configPassport');
var configRedis = require('./configRedis');

var cookieSecret = process.env.COOKIE_SECRET || 'my-secret-value';
var sessionSecret = process.env.SESSION_SECRET || 'my-secret-value';
var logFormat = process.env.NODE_LOG_FORMAT || 'dev';
var port = process.env.PORT || 8080;
var staticDir = process.env.NODE_STATIC_DIR || 
    path.join(__dirname, '../../client');
var uploadDir = process.env.NODE_UPLOAD_DIR || 
    path.join(__dirname, '../../public/upload/temp');


module.exports = function(app) {
    app.set('port', port);
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'jade');

    // Get authentication configurator
    var strategyName = process.env.USE_LOCAL_AUTH ? 'local' : 'wsfed-saml2';

    if (strategyName === 'local') 
        console.warn('Using local authentication');

    authConfig = null;
    if (strategyName === 'wsfed-saml2')
        authConfig = require('./configWsFedSaml2');
    else if (strategyName === 'local')
        authConfig = require('./configLocalAuth');

    authConfig.configurePassport(app);

    // Configure Redis
    var redisStore = configRedis(session);

     // Configure middleware
    app.use(morgan(logFormat));
    console.log('Configuring static dir: %s', staticDir);
    app.use('/public/', express.static(staticDir));
    app.use(cookieParser(cookieSecret));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(multer({dest: uploadDir}));
    app.use(session({
        resave: false,
        saveUninitialized: false,
        store: redisStore,
        secret: sessionSecret
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(methodOverride());
    app.use(flash());
    app.use(errorHandler());
    
    routes.initialize(app, authConfig.configureRoutes);

    return app;
};
