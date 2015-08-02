'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('TrackingEntry', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            activityStepId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ActivityStep' }
            },
            studentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Student' }
            },
            teacherId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Teacher'}
            },

            date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            value: {
                type: Sequelize.STRING,
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
        return queryInterface.dropTable('TrackingEntry');
    }
};
