'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('StudentActivity', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            activityId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Activity' }
            },
            studentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Student' }
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: true
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
        return queryInterface.dropTable('StudentActivity');
    }
};
