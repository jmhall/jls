var models = require('../models');
var util = require('util');
var bbPromise = require('bluebird');

module.exports = {
    home: function(req, res, next) {
        var viewModel = {
            userName: req.user.displayName,
            students: []
        };

        models.Student.findAll({
            attributes: ['id', 'displayName']
        }).then(function(students) {
            viewModel.students = students;
            res.render('teacher-home', viewModel);
        }).catch(function(err) {
            res.send('Error: %s', err);
        });
    },
    studentHome: function(req, res, next) {
        var viewModel = {
            userName: req.user.displayName,
            studentName: '',
            activities: []
        };

        models.Student.findById(req.params.studentId, {
            attributes: ['id', 'displayName'],
            include: [ {
                model: models.Activity,
                as: 'Activities',
                required: true,
                attributes: ['id', 'code', 'title'], 
                include: [{
                    model: models.ActivityChannel, 
                    attributes: ['channelNum', 'description']
                }, {
                    model: models.ActivityCategory,
                    attributes: ['categoryNum', 'description']
                }]
            }]
        }).then(function(student) {
            viewModel.studentName = student.displayName;
            viewModel.student = student;
            viewModel.activities = student.Activities.map(function(activity) {
                var activityUrl = util.format('/teacher/student/%s/activity/%s',
                                            student.id, 
                                            activity.id);

                return {
                    activityUrl: activityUrl,
                    activityId: activity.id,
                    trackingType: '',
                    stepsCount: 0,
                    code: activity.code,
                    name: util.format('%s - %s', activity.code, activity.title),
                    channel: activity.ActivityChannel.description,
                    channelNum: activity.ActivityChannel.channelNum,
                    category: activity.ActivityCategory.description,
                    categoryNum: activity.ActivityCategory.categoryNum,
                    priorEntryDate: null,
                    priorEntryDateClass: '',
                    status: '',
                    progress: 0
                };
            }).sort(function(a, b) {
                if (a.channelNum > b.channelNum)  {
                    return 1;
                }
                else if (a.channelNum < b.channelNum)  {
                    return -1;
                }
                else {
                    if (a.categoryNum > b.categoryNum) {
                        return 1;
                    } else if (a.categoryNum < b.categoryNum) {
                        return -1;
                    } else {
                        return a.code > b.code ? 1 : (a.code < b.code ? -1 : 0);
                    }
                }
            });

            return viewModel;

        }).then(function() {
            var promises = viewModel.activities.map(function(activity) {
                return viewModel.student.getActivityStatus(viewModel.student.id, activity.activityId).then(function(status) {
                    activity.status = status.status;
                    activity.priorEntryDate = status.priorEntryDate;
                    activity.progress = status.progress;
                    activity.trackingType = status.trackingType;
                    activity.stepCount = status.stepCount;
                });
            });

            return bbPromise.all(promises);
        }).then(function() {
            res.render('teacher-student-home', viewModel);
        }).catch(function(err) {
            res.send('Error: %s', err);
        });
    },
    studentIndividualActivity: function(req, res) {
        res.send(util.format('Student: %s, Activity: %s', req.params.studentId, req.params.activityId));
    }
};
