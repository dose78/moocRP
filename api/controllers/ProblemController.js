var bcrypt = require('bcrypt');
var fs = require('fs');
var json2csv = require('json2csv');

module.exports = {

    index: function (req, res, next) {
        var dataset = req.param('dataset');

        if (!_.contains(req.user.datasets, dataset)) {
            return res.redirect('/');
        }

        Problem.findByDataset(dataset, function (err, problems) {
            if (err) return next(err);

            problem_ids = _.pluck(problems, 'problem_id');
            var submission_to_problem = {};
            var problems_hash = {};
            _.each(problems, function (problem) {
                problems_hash[problem.problem_id] = problem;
                problem.num_correct = 0;
                problem.num_submissions = 0;
            });

            Submission.findByProblem_idIn(problem_ids).exec(function (err, submissions) {
                _.each(submissions, function (submission) {
                    submission_to_problem[submission.submission_id] = submission.problem_id;
                });
                var submission_ids = _.pluck(submissions, 'submission_id');
                Assessment.findBySubmission_idIn(submission_ids).exec(function (err, assessments) {
                    _.each(assessments, function (assessment) {
                        var problem_id = submission_to_problem[assessment.submission_id];
                        problems_hash[problem_id].num_submissions++;
                        if (assessment.assessment_grade == 1) {
                            problems_hash[problem_id].num_correct++;
                        }
                    });
                    res.view({
                        dataset: dataset,
                        problems: problems
                    });
                });
            });
        });
},

upload: function (req, res) {
    Researcher.checkPassword(req.body.r_id, req.body.r_pw, function (err, match) {
        if (err) return res.send(err.err);
        if (!match) return res.send('Incorrect password');

        var problemObj = {
            problem_id: req.body.problem_id,
            text: req.body.text,
            answers: req.body.answers,
            concepts: req.body.concepts
        }

        Problem.create(problemObj, function (err, problem) {
            if (err) return next(err);
            res.send(problem);
        });
    });
},

downloadJSON: function (req, res, next) {
    Problem.downloadJSON(req.query, res, next);
},

downloadCSV: function (req, res, next) {
    Problem.downloadCSV(req.query, res, next);
},

conceptVisualize: function (req, res) {
    res.view();
},

conceptData: function (req, res, next) {
    var dataset = req.param('dataset');

    if (!_.contains(req.user.datasets, dataset)) {
        return res.redirect('/');
    }

    Problem.findByDataset(dataset, function (err, problems) {
        if (err) return next(err);

        var concept_hash = {};
        _.each(problems, function (problem) {
            var concept = problem.concepts[0];
            if (concept in concept_hash) {
                concept_hash[concept] += 1;
            } else {
                concept_hash[concept] = 1;
            }
        });

        var json = [];
        for (key in concept_hash) {
            json.push({concept: key, frequency: concept_hash[key] });
        }

        json2csv({data: json, fields: ["concept", "frequency"], del: '\t'}, function (err, tsv) {
            if (err) next(err);

            res.send(tsv);
        });
    });
},

conceptMasteryVisualize: function (req, res) {
    res.view({
        route: "/problem/conceptMasteryData/" + req.param('dataset')
    });
},

conceptMasteryData: function (req, res, next) {
    var dataset = req.param('dataset');

    if (!_.contains(req.user.datasets, dataset)) {
        return res.redirect('/');
    }

    Problem.findByDataset(dataset, function (err, problems) {
        if (err) return next(err);

        problem_ids = _.pluck(problems, 'problem_id');
        var submission_to_concept = {};
        var problem_to_concept = {}
        var concept_hash_right = {};
        var concept_hash_wrong = {};
        _.each(problems, function (problem) {
            var concept = problem.concepts[0];
            problem_to_concept[problem.problem_id] = concept;
            concept_hash_right[concept] = 0;
            concept_hash_wrong[concept] = 0;
        });

        Submission.findByProblem_idIn(problem_ids).exec(function (err, submissions) {
            _.each(submissions, function (submission) {
                submission_to_concept[submission.submission_id] = problem_to_concept[submission.problem_id];
            });
            var submission_ids = _.pluck(submissions, 'submission_id');
            Assessment.findBySubmission_idIn(submission_ids).exec(function (err, assessments) {
                _.each(assessments, function (assessment) {
                    var concept = submission_to_concept[assessment.submission_id];
                    if (assessment.assessment_grade == 1) {
                        concept_hash_right[concept]++;
                    } else {
                        concept_hash_wrong[concept]++;
                    }
                });
                var csv = 'Concept,Incorrect,Correct\n';
                _.each(Object.keys(concept_hash_wrong), function (concept) {
                    var num_correct = concept_hash_right[concept];
                    var num_incorrect = concept_hash_wrong[concept];
                    csv = csv + concept + ',' + num_incorrect + ',' + num_correct + '\n';
                });

                // var csv = "State,Under 5 Years,5 to 13 Years,14 to 17 Years,18 to 24 Years,25 to 44 Years,45 to 64 Years,65 Years and Over\nAL,310504,552339,259034,450818,1231572,1215966,641667\nAK,52083,85640,42153,74257,198724,183159,50277\n";
                res.send(csv);
            });
        });
    });
},

visualize: function (req, res) {
    Problem.findOne(req.param('id'), function (err, problem) {
        if (err) return next(err);
        if (!problem) return next();

        Submission.findByProblem_id(problem.problem_id, function (err, submissions) {
            if (err) return next(err);

            var answers_hash = {};
            var correct_answer = "";
            _.each(problem.answers, function (answer) {
                answers_hash[answer.text] = 0;
                if (answer.correct) {
                    correct_answer = answer.text;
                }
            });

            var num_responses = 0;
            _.each(submissions, function (submission) {
                answers_hash[submission.submission_answer] += 1;
                num_responses++;
            });

            var json_array = [-1];
            _.each(answers_hash, function (count, text) {
                var answer_hash = {};
                answer_hash['answer_text'] = text;
                answer_hash['count'] = count;
                if (text == correct_answer) {
                    json_array[0] = answer_hash;
                } else {
                    json_array.push(answer_hash);
                }
            });

            res.view({
                problem: problem,
                answers_hash: answers_hash,
                answers_json: json_array,
                correct_answer: correct_answer,
                num_responses: num_responses,
                route: "/problem/responseData/" + req.param('id')
            });
        });
    });
},

responseData: function (req, res, next) {
    Problem.findOne(req.param('id'), function (err, problem) {
        if (err) return next(err);
        if (!problem) return next();

        Submission.findByProblem_id(problem.problem_id, function (err, submissions) {
            if (err) return next(err);

            var answers_hash = {};
            var correct_answer = "";
            _.each(problem.answers, function (answer) {
                answers_hash[answer.text] = 0;
                if (answer.correct) {
                    correct_answer = answer.text;
                }
            });

            var num_responses = 0;
            _.each(submissions, function (submission) {
                answers_hash[submission.submission_answer] += 1;
                num_responses++;
            });

            var json_array = [-1];
            _.each(answers_hash, function (count, text) {
                var answer_hash = {};
                // answer_hash['answer_text'] = text;
                rounded_count = Math.round((count/num_responses)*1000)/10
                answer_hash['answer_text'] = String(rounded_count) + '%';
                answer_hash['count'] = count;
                if (text == correct_answer) {
                    json_array[0] = answer_hash;
                } else {
                    json_array.push(answer_hash);
                }
            });

            json2csv({data: json_array, fields: ["answer_text", "count"]}, function (err, csv) {
                if (err) next(err);

                res.send(csv);
            });
        });
});
},

destroy: function(req, res, next) {
    Problem.findOne(req.param('id'), function (err, problem) {
        if (err) return next(err);
        if ( problem) return next('Problem does not exist');

        Problem.destroy(req.param('id'), function (err) {
            if (err) return next(err);

            res.redirect('back');
        });
    });
}

}
