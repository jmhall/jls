'use strict';
var moment = require('moment');
var bbPromise = require('bluebird');
var models = require('./index');
var _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
    var Student = sequelize.define('Student', {
        displayName: { type: DataTypes.INTEGER, allowNull: false, defaultValue: ''},
        firstName: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
        lastName: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
        startDate: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        endDate: {type: DataTypes.DATE}
    }, {
        classMethods: {
            associate: function(models) {
                Student.belongsToMany(models.Activity, { through: 'StudentActivity', foreignKey: 'studentId' });

                Student.hasMany(models.TrackingEntry, { as: 'TrackingEntries', foreignKey: 'studentId' });
            },
        },
        instanceMethods: {
            getActivityStatus: function(studentId, activityId, asOfDate) {
                if (!activityId)
                    throw new Error('activityId required');

                var status = {
                    priorEntryDate: null,
                    progress: 0,
                    status: 'assigned',
                    trackingType: '',
                    stepCount: 0
                };

                return this.sequelize.models.Activity.findById(activityId, {
                    include: [{
                        model: this.sequelize.models.TrackingType,
                        attributes: ['code']
                    }],
                    attributes: ['id']
                }).then(function(activity) {

                    status.trackingType = activity.TrackingType.code;

                    return this.sequelize.models.ActivityStep.count({
                        where: {
                            activityId: activity.id,
                            stepNum: {
                                $gt: 0
                            }
                        }
                    });
                }).then(function(stepCount) {

                    status.stepCount = stepCount;

                    return this.sequelize.query('select "TE"."date", "TE"."value", "AS"."stepNum" from "TrackingEntry" as "TE" join "ActivityStep" as "AS" on "TE"."activityStepId" = "AS"."id" where "TE"."studentId" = ? and "AS"."activityId" = ?', {
                        replacements: [studentId, activityId]
                    });

                }).then(function(trackingEntries) {

                    if (trackingEntries.length > 0) {
                        var mostRecent = _.max(trackingEntries[0], 'date');
                        if (mostRecent) {
                            status.priorEntryDate = moment(mostRecent.date).format('MM/DD/YYYY');
                        }

                        updateStatus(status, trackingEntries[0]);

                    }

                    return status;
                });
            }
        }
    });
    return Student;
};

function updateStatus(status, trackingEntries) {
    var maxStepNum = 0;
    if (status.trackingType === '1 CHECK' || status.trackingType === '3 CHECK') {
        // Look for highest stepNum with 'PM' or 'MASTERED'
        maxStepNum = trackingEntries.reduce(function(prev, curr) {
            if (curr.value === 'PM' || curr.value === 'MASTERED') {
                if (curr.stepNum > prev)
                    return curr.stepNum;
            }
            return prev;
        }, 0);
    }

    if (status.trackingType === 'Y/N') {
        maxStepNum = trackingEntries.reduce(function(prev, curr) {
            if (curr.value === 'YES')
                if (curr.stepNum > prev)
                    return curr.stepNum;

            return prev;
        }, 0);
    }

    status.progress = maxStepNum / status.stepCount;
    if (maxStepNum === status.stepCount)
        status.status = 'mastered';
    else
        status.status = 'in progress';


}
