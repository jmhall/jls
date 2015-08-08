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
            getActivityStatus: function(studentId, activityId, asOfDate) {
                if (!activityId) 
                    throw new Error('activityId required');

                var status = {
                    priorEntryDate: null,
                    progress: 0,
                    status: 'assigned'
                };

                return this.sequelize.query('select "TE"."date", "TE"."value", "AS"."stepNum" from "TrackingEntry" as "TE" join "ActivityStep" as "AS" on "TE"."activityStepId" = "AS"."id" where "TE"."studentId" = ? and "AS"."activityId" = ?', { 
                    replacements: [studentId, activityId] 
                }).then(function(trackingEntries) {
                    if (trackingEntries.length > 0) {
                        var mostRecent = _.max(trackingEntries[0], 'date');
                        if (mostRecent) {
                           status.priorEntryDate = moment(mostRecent.date).format('MM/DD/YYYY');
                        }
                    }

                    return status;
                });

                //return new bbPromise(function(resolve, reject) {
                    //resolve(status);
                //});
           }
        }
    });
    return Student;
};
