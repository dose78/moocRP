var bcrypt = require('bcrypt');
var fs = require('fs');

module.exports = {

    upload: function (req, res, next) {
        Researcher.checkPassword(req.body.r_id, req.body.r_pw, function (err, match) {
            if (err) return res.send(err.err);
            if (!match) return res.send('Incorrect password');

            var submissionObj = {
                submission_id: req.body.submission_id,
                user_id: req.body.user_id,
                problem_id: req.body.problem_id,
                grader_id: req.body.grader_id,
                submission_timestamp: req.body.submission_timestamp,
                submission_attempt_number: req.body.submission_attempt_number,
                submission_answer: req.body.submission_answer,
                submission_is_submitted: req.body.submission_is_submitted
            }

            Submission.create(submissionObj, function (err, submission) {
                if (err) return next(err);
                res.send(submission);
            });
        });
    },

    download: function (req, res, next) {
        Submission.download(req.query, res, next);
    },

    destroy: function(req, res, next) {
        Submission.findOne(req.param('id'), function (err, submission) {
            if (err) return next(err);
            if (!submission) return next('Submission does not exist');

            Submission.destroy(req.param('id'), function (err) {
                if (err) return next(err);

                res.redirect('back');
            });
        });
    }

};
