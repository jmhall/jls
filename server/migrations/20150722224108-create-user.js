'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        unique: true
      },
      azureId: {
        type: Sequelize.STRING
      },
      isAdmin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      password: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: ''
      },
      active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    } );
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};
