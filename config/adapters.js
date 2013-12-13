module.exports.adapters = {

    'default': 'mongo',

    mongo: {
        module   : 'sails-mongo',
        url: process.env.DB_URL
    }

};
