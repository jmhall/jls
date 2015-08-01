'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('Activity', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            activityChannelId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ActivityChannel' }
            },
            activityCategoryId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ActivityCategory' }
            },
            parentActivityId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'Activity' }
            },
            trackingTypeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'TrackingType'}
            },

            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
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
            stepsAreProgressive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            customPerStudent: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        return queryInterface.dropTable('Activity');
    }
};
