var passport = require('passport')
, GitHubStrategy = require('passport-github').Strategy;

var verifyHandler = function (token, tokenSecret, profile, done) {
    process.nextTick(function () {

        Researcher.findOne({uid: profile.id}).done(function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                Researcher.create({
                    provider: profile.provider,
                    uid: profile.id,
                    name: profile.displayName
                }).done(function (err, user) {
                    return done(err, user);
                });
            }
        });
    });
};

passport.serializeUser(function (user, done) {
    done(null, user.uid);
});

passport.deserializeUser(function (uid, done) {
    Researcher.findOne({uid: uid}).done(function (err, user) {
        done(err, user)
    });
});

module.exports = {
    express: {
        customMiddleware: function (app) {
            passport.use(new GitHubStrategy({
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                callbackURL: "http://moocrp.herokuapp.com/auth/github/callback"
            },
            verifyHandler
            ));

            app.use(passport.initialize());
            app.use(passport.session());
        }
    }

};
