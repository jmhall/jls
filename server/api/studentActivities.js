var models = require('../models');
var StudentActivitySerializer = require('./serializers/studentActivities');

module.exports = function(req, res) {
    models.Student.find({
        attributes: ['id'],
        include: {
            model: models.Activity, 
            as: 'Activities',
            required: true,
            attributes: ['id']
        }
    }).then(function(student) {


        if (student)
            res.send('student id ' + student.id);
        else 
            res.send('No students');
    }, function(err) {
        res.send('Error ' + err);

    });

    //var json = new StudentActivitySerializer();
};
