var mongoose = require('mongoose');


var mongoDbConnStr = process.env.MONGOCONNSTR || 
            'mongodb://localhost:27017/test';

module.exports = {
    connStr: mongoDbConnStr,
    configure: function() {
                // Mongoose setup
        var mongooseOptions = { 
            server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
            replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
        };
        mongoose.connect(mongoDbConnStr);
        var conn = mongoose.connection;

        conn.on('error', console.error.bind(console, 'connection error:'));

        conn.on('open', console.log.bind(console, 'mongoose connection opened'));


    }
};
