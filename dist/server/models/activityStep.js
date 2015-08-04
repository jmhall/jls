'use strict';

module.exports = function(sequelize, DataTypes) {
    var ActivityStep = sequelize.define('ActivityStep', {
        stepNum: { type: DataTypes.INTEGER, allowNull: false },
        title: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.TEXT, allowNull: false, defaultValue: ''}
    }, {
        classMethods: {
            associate: function(models) {
                ActivityStep.belongsTo(
                    models.Activity, { foreignKey: 'activityId' }
                );
            }
        }
    });
    return ActivityStep;
};
