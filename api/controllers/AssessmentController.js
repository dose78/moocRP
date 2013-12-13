var bcrypt = require('bcrypt');
var fs = require('fs');

module.exports = {

    upload: function (req, res, next) {
        Researcher.checkPassword(req.body.r_id, req.body.r_pw, function (err, match) {
            if (err) return res.send(err.err);
            if (!match) return res.send('Incorrect password');

            var assessmentObj = {
                assessment_id: req.body.assessment_id,
                submission_id: req.body.submission_id,
                assessment_grader_id: req.body.assessment_grader_id,
                assessment_feedback: req.body.assessment_feedback,
                assessment_grade: req.body.assessment_grade,
                assessment_timestamp: req.body.assessment_timestamp
            }

            Assessment.create(assessmentObj, function (err, assessment) {
                if (err) return next(err);
                res.send(assessment);
            });
        });
    },

    download: function (req, res, next) {
        Assessment.download(req.query, res, next);
    },

    destroy: function(req, res, next) {
        Assessment.findOne(req.param('id'), function (err, assessment) {
            if (err) return next(err);
            if (!assessment) return next('Assessment does not exist');

            Assessment.destroy(req.param('id'), function (err) {
                if (err) return next(err);

                res.redirect('back');
            });
        });
    }

};
