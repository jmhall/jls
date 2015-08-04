var models = require('../models');

module.exports = {
    home: function(req, res, next) {
        var viewModel = {
            userName: req.user.displayName,
            students: []
        };

        models.Student.findAll({
            attributes: ['id', 'displayName']
        }).then(function(students) {
            viewModel.students = students;
            res.render('teacher-home', viewModel);
        }).catch(function(err) {
            res.send('Error: %s', err);
        });
    },
    studentHome: function(req, res, next) {
        var viewModel = {
            userName: req.user.displayName,
            studentName: '',
            workingList: [],
            masteredList: []
        };

        models.Student.findById(req.params.studentId).then(function(student) {
            viewModel.studentName = student.displayName;
            res.render('teacher-student-home', viewModel);
        });
    }
};
