module.exports = {
    home: function(req, res) {
        var viewModel = {
            userName: req.user.displayName,
            students: []
        };

        res.render('teacher-home', viewModel);
    }
};
