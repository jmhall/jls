module.exports = {
    home: function(req, res) {
        var viewModel = {
            userName: req.user.displayName,
        };
        res.render('home', viewModel);
    }
};
