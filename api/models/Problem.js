var fs = require('fs');
var json2csv = require('json2csv');

module.exports = {

    attributes: {
        problem_id: 'INTEGER',
        text: 'TEXT',
        answers: 'ARRAY',
        concepts: 'ARRAY',
        problem_release_timestamp: 'DATETIME',
        problem_deadline_timestamp: 'DATETIME',
        problem_max_submission: 'INTEGER',
        problem_type: {
            type: 'STRING',
            defaultsTo: 'MC'
        },
        dataset: {
            type: 'STRING',
            defaultsTo: 'CS169'
        }
    },

    downloadJSON: function (args, res, next) {
        var limit = parseInt(args['mdb_limit']);
        if (limit != undefined) delete args['mdb_limit'];

        var sort = args['mdb_sort'];
        if (sort != undefined) delete args['mdb_sort'];
        else sort = 'createdAt';

        Problem.find(args).limit(limit).sort(sort).done(function (err, problems) {
            if (err) next(err);

            var file = 'problems.json';
            fs.writeFile(file, JSON.stringify(problems, null, '\t'), function (err) {
                if (err) next(err);

                res.download(file, file, function (err) {
                    if (err) next(err);

                    fs.unlink(file, function (err) {
                        if (err) next(err);
                    });
                });
            });
        });
    },

    downloadCSV: function (args, res, next) {
        var limit = parseInt(args['mdb_limit']);
        if (limit != undefined) delete args['mdb_limit'];

        var sort = args['mdb_sort'];
        if (sort != undefined) delete args['mdb_sort'];
        else sort = 'createdAt';

        Problem.find(args).limit(limit).sort(sort).done(function (err, problems) {
            if (err) next(err);

            json2csv({data: problems, fields: Object.keys(Problem.attributes)}, function (err, csv) {
                if (err) next(err);

                var file = 'problems.csv';
                fs.writeFile(file, csv, function (err) {
                    if (err) next(err);

                    res.download(file, file, function (err) {
                        if (err) next(err);

                        fs.unlink(file, function (err) {
                            if (err) next(err);
                        });
                    });
                });
            });
        });
    }

};
