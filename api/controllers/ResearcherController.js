module.exports = {

    index: function (req, res) {
        Researcher.find(function (err, researchers) {
            if (err) return next(err);

            res.view({
                researchers: researchers
            });
        });
    },

    updateDatasets: function (req, res, next) {
        var dsObj = {
            id: req.query.id,
            dataset: req.query.dataset
        }

        Researcher.updateDatasets(dsObj, function (err, researcher) {
            if (err) {
                req.session.flash = {
                    err: err
                }
            }
            return res.redirect('/researcher');
        });
    },

    editPassword: function (req, res, next) {
        res.view({
            researcher: req.user
        });
    },

    updatePassword: function (req, res, next) {
        var pwObj = {
            id: req.user.id,
            password: req.user.password,
            oldPassword: req.param('old-password'),
            newPassword: req.param('new-password'),
            confirmation: req.param('confirmation'),
        }

        Researcher.updatePassword(pwObj, function (err, researcher) {
            if (err) {
                req.session.flash = {
                    err: err
                }
                return res.redirect('/researcher/editPassword');
            } else {
                return res.redirect('/');
            }
        });
    }

};
