var db = require('../server/models');

var email = 'IT@jacobsladderschool.net';

var user = {
    displayName: 'Matt H.',
    azureId: '633a6037-f671-4ab0-960b-366e6cc9fcf5',
    isAdmin: true
};

db.User.findOrCreate({where: {email: user.email}, defaults: user})
.then(function() { 
    console.log('OK!');
}).catch(function(err) {
    console.error('Error: ', err.message);
}).then(function() {
    db.sequelize.close();
});

