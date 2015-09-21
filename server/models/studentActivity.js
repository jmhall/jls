'use strict';

module.exports = function(sequelize, DataTypes) {
    var StudentActivity = sequelize.define('StudentActivity', {
        startDate: { type: DataTypes.DATE, allowNull: false },
        endDate: { type: DataTypes.DATE, allowNull: false }
    }, {
        classMethods: {
            associate: function(models) {
                StudentActivity.belongsTo(
                    models.Activity,
                    {
                        foreignKey: 'activityId'
                    }
                );
                StudentActivity.belongsTo(
                    models.Student,
                    {
                        foreignKey: 'studentId'
                    }
                );
            }
        }
    });

    return StudentActivity;
};
