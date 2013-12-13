// node DataUploader.js 52a56ebcd796d90000000001 moocrp 100
// last number is number of users

var domain = 'http://localhost:1337'
// var domain = 'http://moocrp.herokuapp.com'

var unirest = require('unirest');
var path = require('path');
var fs = require('fs');
var Chance = require('chance');
var chance = new Chance();

function uploadUser (r_id, r_pw, user_id, user_firstname, user_lastname, user_gender, user_birthdate, user_ip, user_timezone_offset) {
    unirest.post(domain + '/user/upload')
    .send({
        r_id: r_id,
        r_pw: r_pw,
        user_id: user_id,
        user_firstname: user_firstname,
        user_lastname: user_lastname,
        user_gender: user_gender,
        user_birthdate: user_birthdate,
        user_ip: user_ip,
        user_timezone_offset: user_timezone_offset
    })
    .end(function (res) {
        console.log('uploaded user ' + (user_id+1));
    })
}

function uploadProblem (r_id, r_pw, problem_id, text, answers, concepts) {
    unirest.post(domain + '/problem/upload')
    .send({
        r_id: r_id,
        r_pw: r_pw,
        problem_id: problem_id,
        text: text,
        answers: answers,
        concepts: concepts
    })
    .end(function (res) {
        console.log('uploaded problem ' + (problem_id+1));
    })
}

function uploadSubmission (r_id, r_pw, submission_id, user_id, problem_id, grader_id, submission_timestamp, submission_attempt_number, submission_answer, submission_is_submitted) {
    unirest.post(domain + '/submission/upload')
    .send({
        r_id: r_id,
        r_pw: r_pw,
        submission_id: submission_id,
        user_id: user_id,
        problem_id: problem_id,
        grader_id: grader_id,
        submission_timestamp: submission_timestamp,
        submission_attempt_number: submission_attempt_number,
        submission_answer: submission_answer,
        submission_is_submitted: submission_is_submitted
    })
    .end(function (res) {
        // console.log('uploaded submission ' + (submission_id+1));
    })
}

function uploadAssessment (r_id, r_pw, assessment_id, submission_id, assessment_grader_id, assessment_feedback, assessment_grade, assessment_timestamp) {
    unirest.post(domain + '/assessment/upload')
    .send({
        r_id: r_id,
        r_pw: r_pw,
        assessment_id: assessment_id,
        submission_id: submission_id,
        assessment_grader_id: assessment_grader_id,
        assessment_feedback: assessment_feedback,
        assessment_grade: assessment_grade,
        assessment_timestamp: assessment_timestamp
    })
    .end(function (res) {
        // console.log('uploaded assessment ' + (user_id+1));
    })
}

function generateDividers (numAnswers) {
    num_dividers = numAnswers-1;
    dividers = [chance.integer({min: 0, max: 100})];
    for (var divider_id=1; divider_id<num_dividers; divider_id++) {
        dividers.push(chance.integer({min: 0, max: 100}));
    }
    dividers.sort();
    return dividers;
}

function get_correct_answer (answers) {
    for (var i = 0; i < answers.length; i++) {
        if (answers[i].correct) {
            return answers[i];
        }
    }
    return -1;
}

function getRandomAnswerId (dividers) {
    var random_num = chance.integer({min: 0, max: 100});
    for (var divider_id=0; divider_id<dividers.length; divider_id++) {
        if (random_num <= dividers[divider_id]) {
            answer_id = divider_id;
            break;
        }
        answer_id = num_dividers;
    }
    return answer_id;
}

var r_id = process.argv[2].toString();
var r_pw = process.argv[3].toString();
var num_users = parseInt(process.argv[4]);

// upload users
for (var user_id=0; user_id<num_users; user_id++) {
    uploadUser(r_id, r_pw, user_id, chance.first(), chance.last(), chance.gender(), chance.birthday(), chance.ip(), chance.integer({min: -12, max: 12}));
}

// upload problems, submissions, and assessments
var base_probabiliy_of_answering_problem_correct = 50;
var dir = __dirname + '/json_problems';
fs.readdir(dir, function (err, files) {
    if (err) throw err;
    var problem_id = 0;
    var submission_id = 0;
    files.forEach(function (file) {
        // var file = files[0]; // ONLY UNCOMMENT FOR TESTING; if so, comment previous line
        var filePath = dir + '/' + file;
        var concepts = [path.basename(file, '.json')];
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) throw err;
            JSON.parse(data).problems.forEach(function (problem) {
                var dividers = generateDividers(problem.answers.length);
                var probabiliy_of_answering_problem = chance.integer({min: 25, max: 100});
                var correct_answer = get_correct_answer(problem.answers);
                if (correct_answer != -1) {
                    uploadProblem(r_id, r_pw, problem_id, problem.text, problem.answers, concepts);

                    // upload responses for this problem
                    for (var user_id=0; user_id<num_users; user_id++) {
                        if (chance.integer({min: 0, max: 100}) < probabiliy_of_answering_problem) {
                            var timestamp = chance.date();
                            if (chance.integer({min: 0, max: 100}) < base_probabiliy_of_answering_problem_correct) {
                                var submission_answer = correct_answer;
                            } else {
                                var submission_answer = problem.answers[getRandomAnswerId(dividers)];
                            }
                            var grade = submission_answer.correct ? 1 : 0;
                            uploadSubmission(r_id, r_pw, submission_id, user_id, problem_id, 0, timestamp, 1, submission_answer.text, true);
                            uploadAssessment(r_id, r_pw, submission_id, submission_id, 0, '<feedback>', grade, timestamp);
                            submission_id++;
                        }
                    }
                    problem_id++;
                }
            });
        });
    });
});
