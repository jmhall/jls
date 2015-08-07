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
            }
        },
        instanceMethods: {
            getActivityStatus: function(activityId, asOfDate) {
                if (!activityId) 
                    throw new Error('activityId required');

                var status = {
                    priorEntryDate: null,
                    priorEntryDateClass: '',
                    progress: 0,
                    status: '[none]'
                };

                return this.sequelize.query('select "TE".* from "TrackingEntry" as "TE" join "ActivityStep" as "AS" on "TE"."activityStepId" = "AS"."id" where "TE"."studentId" = 1 and "AS"."activityId" = ?', { replacements: [activityId] }).then(function(trackingEntries) {

                    var mostRecent = _.max(trackingEntries[0], 'date');
                    if (mostRecent) {
                        var mostRecentDate = moment(mostRecent.date);
                        var daysSince = moment().diff(mostRecentDate, 'days');
                        status.priorEntryDate = mostRecentDate.format('MM/DD/YYYY');
                        if (daysSince > '197')
                            status.priorEntryDateClass = 'text-warning';
                        else if (daysSince > 137) 
                            status.priorEntryDateClass = 'text-danger';
                        else 
                            status.priorEntryDateClass = 'text-success';
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
