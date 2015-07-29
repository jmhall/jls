'use strict';

var trackingTypes = [
	'3 CHECK', 
	'1 CHECK', 
	'% X25', 
	'% X5', 
	'% X4', 
	'% X3', 
	'Y/N', 
	'S/S', 
	'TIME',
    'TAT',
    'LOI',
    'WKBK',
	'UNKNOWN'
];

module.exports = function(sequelize, DataTypes) {
    var Activity = sequelize.define('Activity', {
        code: {type: DataTypes.STRING, allowNull: false, unique: true},
        title: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.TEXT, allowNull: false, defaultValue: ''},
        trackingType: {type: DataTypes.ENUM(trackingTypes), allowNull: false, defaultValue: 'UNKNOWN'},
        stepsAreProgressive: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        customPerStudent: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false} 
    }, {
        classMethods: {
            associate: function(models) {
                Activity.hasOne(
                    models.ActivityChannel, { foreignKey: 'activityChannelId' }
                );
                Activity.hasOne(
                    models.ActivityCategory, { foreignKey: 'activityCategoryId' }
                );
            }
        }
    });
    return Activity;
};
