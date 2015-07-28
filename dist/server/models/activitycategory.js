'use strict';
module.exports = function(sequelize, DataTypes) {
  var ActivityCategory = sequelize.define('ActivityCategory', {
    categoryNum: {type: DataTypes.INTEGER, allowNull: false, unique: true},
    description: {type: DataTypes.STRING, allowNull: false}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return ActivityCategory;
};
