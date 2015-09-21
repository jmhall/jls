var models = require('../models');
var StudentActivitySerializer = require('./serializers/studentActivities');
var util = require('util');

// Translate a studentActivity to a format suitable for jsonapi
function translate(sa) {
    var obj = {
        id: sa.id,
        startDate: sa.get('startDate'),
        endDate: sa.get('endDate'),
        student: { id: sa.studentId },
        activity: { id: sa.activityId }
    };

    return obj;
}

module.exports = function(req, res) {
    models.StudentActivity.find({
        attributes: ['id', 'startDate', 'endDate', 'studentId', 'activityId'],
    }).then(function(studentActivity) {
        if (studentActivity) {
            //TODO: fix base URL generation, we need to do better than this
            var baseUrl = util.format('%s//%s/api', req.protocol, req.get('host'));

            var json = new StudentActivitySerializer(translate(studentActivity), baseUrl)
                .serialize();
            res.send(json);
        }
    }, function(err) {
        res.send('Error ' + err);

    });

    //var json = new StudentActivitySerializer();
};
