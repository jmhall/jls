'use strict';

module.exports = function(sequelize, DataTypes) {
    var TrackingEntry = sequelize.define('TrackingEntry', {
        date: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        value: {type: DataTypes.STRING, allowNull: false, defaultValue: ''}
    }, {
        classMethods: {
            associate: function(models) {
                TrackingEntry.belongsTo(
                    models.ActivityStep, { 
                        foreignKey: 'activityStepId' 
                    }
                );
                TrackingEntry.belongsTo(
                    models.Student, { 
                        foreignKey: 'studentId'
                    }
                );
                TrackingEntry.belongsTo(
                    models.Teacher, { 
                        foreignKey: 'teacherId' 
                    }
                );
            }
        }
    });
    return TrackingEntry;
};
