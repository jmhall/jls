'use strict';

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
        }
    });
    return Student;
};
