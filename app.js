'use strict';

var express = require('express');
var passport = require('passport');
var http = require('http');
var config = require('./configure');

var app = express();
app = config(app);

var server = http.createServer(app);
var boot = function() {
    server.listen(app.get('port'), function() {
        console.info('Listening on port %s', app.get('port'));
    });
};

var shutdown = function() { 
    server.close();
};

if (require.main === module) {
    console.info('Booting');
    boot();
} else {
    console.info('Running app as a module');
    exports.boot = boot;
    exports.shutdown = shutdown;
}

