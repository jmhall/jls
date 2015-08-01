'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('Student', {
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
            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ''
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ''
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            endDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('Student');
    }
};
