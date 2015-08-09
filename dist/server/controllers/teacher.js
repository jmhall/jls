var models = require('../models');
var util = require('util');
var bbPromise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');

var codeRe = /([0-9]+)\.([0-9]+)\.([0-9]+)-?([0-9]+)?/;

function getCodeSort(code) {
    var match = codeRe.exec(code);
    if (!match) {
        return 0;
    }  else {
        var channel = ('0000' + match[1]).slice(-4);
        var category = ('0000' + match[2]).slice(-4);
        var num = ('0000' + match[3]).slice(-4);
        var subNum = '0000';
        if (match[4]) 
            subNum = ('0000' + match[4]).slice(-4);

        var sortNum = util.format('%s%s%s%s', channel, category, num, subNum);

        return parseInt(sortNum);
    }

    return 0;
}

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
                var aSort = getCodeSort(a.code);
                var bSort = getCodeSort(b.code);

                return (aSort > bSort ? 1 : (aSort < bSort) ? -1 : 0);
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
        var viewModel = {
            userName: req.user.displayName,
            studentName: '',
            dateIntroduced: '',
            activityTitle: '',
            activityStatus: '',
            activityHistory: []
        };

        return models.Student.findById(req.params.studentId, {
            attributes: ['id', 'displayName']
        }).then(function(student) {
            viewModel.studentName = student.displayName;
            viewModel.student = student;

            return models.Activity.findById(req.params.activityId, {
                attributes: ['id', 'code', 'title', 'description'],
                include: [{
                    model: models.TrackingType
                }]
            });

        }).then(function(activity) {
            viewModel.activityTitle = util.format('%s - %s', activity.code, activity.title);
            
            return viewModel.student.getActivityStatus(viewModel.student.id, activity.id);
        }).then(function(status) {
            viewModel.activityStatus = status.status;

            return models.TrackingEntry.findAll({ 
                attributes: ['date', 'value'],
                where: {
                    studentId: viewModel.student.id
                },
                include: [{
                    model: models.ActivityStep,
                    attributes: ['stepNum', ['title', 'stepTitle']],
                    include: {
                        model: models.Activity,
                        attributes: [['id', 'activityId']],
                        where: { id: req.params.activityId }
                    }
                }, {
                    model: models.Teacher,
                    attributes: [['lookupInitials', 'teacherName']]
                }],
                order: [['date', 'DESC']]
            });

        }).then(function(entries) {
            viewModel.activityHistory = entries.map(function(entry) {
                return {
                    date: moment(entry.date).format('MM/DD/YYYY'),
                    teacher: entry.Teacher.dataValues.teacherName,
                    value: util.format('%s - %s', entry.ActivityStep.dataValues.stepTitle, entry.value),
                    stepNum: entry.ActivityStep.dataValues.stepNum
                };
            });

            var introEntry = _.find(viewModel.activityHistory, function(history) {
                return history.stepNum === 0;
            });

            if (introEntry) 
                viewModel.dateIntroduced = introEntry.date;


            res.render('teacher-student-individual-activity', viewModel);
        }).catch(function(err) {
            res.status(500).send('Error: ' + err);
        });
    }
};
