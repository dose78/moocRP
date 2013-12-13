var bcrypt = require('bcrypt');
var fs = require('fs');

module.exports = {

    upload: function (req, res, next) {
        Researcher.checkPassword(req.body.r_id, req.body.r_pw, function (err, match) {
            if (err) return res.send(err.err);
            if (!match) return res.send('Incorrect password');

            var userObj = {
                user_id: req.body.user_id,
                user_firstname: req.body.user_firstname,
                user_lastname: req.body.user_lastname,
                user_gender: req.body.user_gender,
                user_birthdate: req.body.user_birthdate,
                user_ip: req.body.user_ip,
                user_timezone_offset: req.body.user_timezone_offset
            }

            User.create(userObj, function (err, user) {
                if (err) return next(err);
                res.send(user);
            });
        });
    },

    download: function (req, res, next) {
        User.download(req.query, res, next);
    },

    destroy: function(req, res, next) {
        User.findOne(req.param('id'), function (err, user) {
            if (err) return next(err);
            if (!user) return next('User does not exist');

            User.destroy(req.param('id'), function (err) {
                if (err) return next(err);

                res.redirect('back');
            });
        });
    }

};
