'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    displayName: DataTypes.STRING,
    email: DataTypes.STRING,
    azureId: DataTypes.STRING,
    isAdmin: {type: DataTypes.BOOLEAN, defaultValue: false},
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};
