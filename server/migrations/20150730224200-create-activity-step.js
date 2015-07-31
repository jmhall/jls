'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('ActivityStep', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            activityId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
                references: { model: 'Activity' }
            },

            stepNum: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: ''
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
        return queryInterface.dropTable('ActivityStep');
    }
};
