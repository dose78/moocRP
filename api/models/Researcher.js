var bcrypt = require('bcrypt');

module.exports = {

    schema: true,

    attributes: {
        provider: 'STRING',
        uid: 'INTEGER',
        name: 'STRING',
        password: {
            type: 'STRING',
            defaultsTo: '$2a$10$Xg9OH0GHaC8ugzr/uOlBieAlsup8j3SYo9CERgwf1/rOeWRgevbsO'
        },
        admin: {
            type: 'BOOLEAN',
            defaultsTo: false
        },
        datasets: {
            type: 'ARRAY',
            defaultsTo: []
        },

        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },

    checkPassword: function (id, password, next) {
        Researcher.findOne(id, function (err, researcher) {
            if (err) return next(err);
            if (researcher === undefined) return next({err: 'Invalid ID'});

            bcrypt.compare(password, researcher.password, next);
        });
    },

    updateDatasets: function (values, next) {
        Researcher.findOne(values.id).done(function (err, researcher) {
            if (err) next(err);

            var ds = researcher.datasets.slice();
            if (_.contains(researcher.datasets, values.dataset)) {
                ds = _.without(ds, values.dataset);
            } else {
                ds.push(values.dataset);
            }

            Researcher.update(values.id, {datasets: ds}, function (err, researcher) {
                if (err) next(err);

                return next();
            });
        });
    },

    updatePassword: function (values, next) {
        if (values.newPassword != values.confirmation) {
            return next({err: "New password doesn't match confirmation"});
        }

        bcrypt.compare(values.oldPassword, values.password, function (err, match) {
            if (!match) return next({err: "Incorrect password"});

            bcrypt.hash(values.newPassword, 10, function (err, hash) {
                Researcher.update(values.id, {password: hash}, function (err, researcher) {
                    if (err) next(err);

                    next();
                });
            });
        });
    }

};
