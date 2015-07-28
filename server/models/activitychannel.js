'use strict';
module.exports = function(sequelize, DataTypes) {
  var ActivityChannel = sequelize.define('ActivityChannel', {
    channelNum: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return ActivityChannel;
};