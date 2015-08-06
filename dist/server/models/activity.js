'use strict';

module.exports = function(sequelize, DataTypes) {
    var Activity = sequelize.define('Activity', {
        code: {type: DataTypes.STRING, allowNull: false, unique: true},
        title: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.TEXT, allowNull: false, defaultValue: ''},
        stepsAreProgressive: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        customPerStudent: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false} 
    }, {
        classMethods: {
            associate: function(models) {
                Activity.belongsTo(
                    models.ActivityChannel, { foreignKey: 'activityChannelId' }
                );
                Activity.belongsTo(
                    models.ActivityCategory, { foreignKey: 'activityCategoryId' }
                );
                Activity.belongsTo(
                    models.TrackingType, { foreignKey: 'trackingTypeId' }
                );

                Activity.hasMany(
                    models.ActivityStep, { as: 'Steps', foreignKey: 'activityId' }
                );

                Activity.belongsToMany( models.Student, { through: 'StudentActivity', foreignKey: 'activityId' });
            }
        }
    });
    return Activity;
};
