module.exports.policies = {

    '*': ['authenticated', 'flash'],

    'researcher': {
        'index': ['authenticated', 'flash', 'admin'],
        'updateDatasets': ['authenticated', 'flash', 'admin'],
        'update': ['authenticated', 'flash', 'admin'],
        'create': ['authenticated', 'flash', 'admin'],
        'destroy': ['authenticated', 'flash', 'admin']
    },

    'auth': {
        '*': true
    },

    'problem': {
        'upload': true
    },

    'user': {
        'upload': true
    },

    'submission': {
        'upload': true
    },

    'assessment': {
        'upload': true
    }
};
