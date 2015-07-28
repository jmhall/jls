'use strict';

var trackingTypes = require('./trackingTypes');
var ActivityChannel = require('./activityChannel');

module.exports = function(sequelize, DataTypes) {
    var Activity = sequelize.define('Activity', {
        //activityChannelId: {
            //type: DataTypes.INTEGER,
            //allowNull: false,
            //references: { model: ActivityChannel }
        //},

        code: {type: DataTypes.STRING, allowNull: false, unique: true},
        title: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.TEXT, allowNull: false, defaultValue: ''},
        trackingType: {type: DataTypes.ENUM(trackingTypes), allowNull: false, defaultValue: 'UNKNOWN'},
        stepsAreProgressive: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        customPerStudent: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false} 
    }, {
        classMethods: {
            associate: function(models) {
                Activity.hasOne(models.ActivityChannel);
            }
        }
    });
    return Activity;
};
