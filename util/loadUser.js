var mongoose = require('mongoose');
var User = require('../server/models/user');
var mongoDbConnStr = process.env.MONGOCONNSTR || 
        'mongodb://localhost:27017/test';

mongoose.connect(mongoDbConnStr);

var user = new User({
    email: 'IT@jacobsladderschool.net',
    displayName: 'Matt H.',
    azureId: '633a6037-f671-4ab0-960b-366e6cc9fcf5',
    isAdmin: true
});

user.save();

mongoose.disconnect();
