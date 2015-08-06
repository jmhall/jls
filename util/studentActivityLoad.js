var models = require('../server/models');
var _ = require('lodash');

models.Student.findAll({
    attributes: ['id', 'displayName'],
    include: [ { 
        model: models.TrackingEntry, 
        as: 'TrackingEntries',
        required: true,
        attributes: ['id'],
        include: [ {
            model: models.ActivityStep,
            required: true,
            attributes: ['activityId']
        }]
    } ]
}).then(function(students) {
    //console.log(JSON.stringify(student));
    
    var activityIds = students.map(function(student) {
        return student.TrackingEntries.map(function(entry) {
            return entry.ActivityStep.activityId;
        });
    });

    // Cheating here, knowing I only have 1 student
    return students[0].setActivities(_.uniq(activityIds[0]));

    //console.log(JSON.stringify(activityIds));
    //return student.setStudentActivities()
})
.finally(function() {
    models.sequelize.close();
});
