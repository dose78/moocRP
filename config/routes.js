module.exports.routes = {

    '/': {
        controller: 'home'
    },

    '/login': {
        controller: 'auth',
        action: 'index'
    },

    '/logout': {
        controller: 'auth',
        action: 'logout'
    },

    '/problem/index/:dataset': {
        controller: 'problem',
        action: 'index'
    },

    '/problem/visualize/:id': {
        controller: 'problem',
        action: 'visualize'
    },

    '/problem/responseData/:id': {
        controller: 'problem',
        action: 'responseData'
    },

    '/problem/conceptData/:dataset': {
        controller: 'problem',
        action: 'conceptData'
    },

    '/problem/conceptMasteryVisualize/:dataset': {
        controller: 'problem',
        action: 'conceptMasteryVisualize'
    },

    '/problem/conceptMasteryData/:dataset': {
        controller: 'problem',
        action: 'conceptMasteryData'
    }
};
