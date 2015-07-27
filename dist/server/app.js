'use strict';

var express = require('express');
var http = require('http');
var config = require('./configure');

var app = express();
app = config(app);

var server = http.createServer(app);

server.listen(app.get('port'), function() {
    console.info('Listening on port %s', app.get('port'));
});

module.exports = app;
