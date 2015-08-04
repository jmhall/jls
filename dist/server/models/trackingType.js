'use strict';

module.exports = function(sequelize, DataTypes) {
    var TrackingType = sequelize.define('TrackingType', {
        code: {type: DataTypes.STRING, allowNull: false, unique: true},
        name: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.TEXT, allowNull: false, defaultValue: ''},
    }, {
        classMethods: {
            associate: function(models) {

            }
        }
    });

    return TrackingType;
};
