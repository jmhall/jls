var path = require('path');
var express = require('express');
var passport = require('passport');
var wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var multer = require('multer');
var routes = require('./routes');
var flash = require('connect-flash');

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

    /* TEMPORARY */
    
    // Configure passport
    var passportConfig = {
        realm: 'https://JacobsLadder891.onmicrosoft.com/activitytracking_local',
        identityMetadata: 'https://login.microsoftonline.com/8fe02236-b1e3-4544-b615-a1edb2dc4b1a/federationmetadata/2007-06/federationmetadata.xml',
        logoutUrl: 'http://localhost:8080'
    };

    var users = [];
    var findByEmail = function(email, fn) {
        for (var i = 0, len = users.length; i < len; i++) {
            var user = users[i];
            if (user.email === email) {
                return fn(null, user);
            }
        }
        return fn(null, null);
    };

    var wsfedStrategy = new wsfedsaml2(passportConfig, function(profile, done) {
        if (!profile.email) {
            return done(new Error("No email found"), null);
        }

        process.nextTick(function() {
            findByEmail(profile.email, function(err, user) {
                if (err) 
                    return done(err);
                if (!user) {
                    users.push(profile);
                    return done(null, profile);
                }

                return done(null, user);
            });
        });
    });

    passport.use(wsfedStrategy);

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(id, done) {
        findByEmail(id, function(err, user) {
            done(err, user);
        });
    });

    /* END TEMPORARY */


    // Configure middleware
    app.use(morgan(logFormat));
    app.use('/public/', express.static(staticDir));
    app.use(cookieParser(cookieSecret));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(multer({dest: uploadDir}));
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: sessionSecret
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(methodOverride());
    app.use(flash());

    if (process.env.NODE_ENV === 'development') {
        app.use(errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(errorHandler());
    }

    
    routes.initialize(app);


    return app;
};
