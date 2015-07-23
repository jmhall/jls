//var Student = require('../models/student'); 
//var mongoose = require('mongoose');

module.exports = {
    home: function(req, res, next) {
        var viewModel = {
            userName: req.user.displayName,
            students: []
        };

        //Student.find().exec().then(function(students) {
            //viewModel.students = students;

            res.render('teacher-home', viewModel);
        //}).then(null, function(err) {
            //if (err) next(err);
        //});
    },
    studentHome: function(req, res, next) {
        var viewModel = {
            userName: req.user.displayName,
            studentName: '',
            workingList: [],
            masteredList: []
        };

        //Student.findById(req.params.studentId).exec().then(function(student) {
            //viewModel.studentName = student.displayName;
            res.render('teacher-student-home', viewModel);
        //});
    }
};
