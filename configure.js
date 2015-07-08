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
var routes = require('./routes');

module.exports = function(app) {
    var cookieSecret = process.env.COOKIE_SECRET || 'my-secret-value';
    var sessionSecret = process.env.SESSION_SECRET || 'my-secret-value';
    var logFormat = process.env.NODE_LOG_FORMAT || 'dev';
    var port = process.env.PORT || 8080;
    var staticDir = process.env.NODE_STATIC_DIR || 
        path.join(__dirname, '../client');
    var uploadDir = process.env.NODE_UPLOAD_DIR || 
        path.join(__dirname, '../public/upload/temp');

    app.set('port', port);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // Configure middleware
    app.use(morgan(logFormat));
    app.use(multer({dest: uploadDir}));
    app.use(cookieParser(cookieSecret));
    app.use(methodOverride());
    app.use(session({secret: sessionSecret}));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use('/public/', express.static(staticDir));

    console.log('Static dir set to: %s', staticDir);

    if (process.env.NODE_ENV === 'development') {
        app.use(errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(errorHandler());
    }

    // Configure passport
    var passportConfig = {
        identityMetadata: 'https://login.microsoftonline.com/8fe02236-b1e3-4544-b615-a1edb2dc4b1a/federationmetadata/2007-06/federationmetadata.xml'
    };


    routes.initialize(app);


    return app;
};
