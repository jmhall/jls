'use strict';
var trackingTypes = require('../models/trackingTypes');

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('Activities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            activityChannelId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ActivityChannels' }
            },

            activityCategoryId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ActivityCategories' }
            },

            parentActivityId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'Activities' }
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
            trackingType: {
                type: Sequelize.ENUM(trackingTypes),
                allowNull: false,
                defaultValue: 'UNKNOWN'
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
        return queryInterface.dropTable('Activities');
    }
};
