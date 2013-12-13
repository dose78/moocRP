var passport = require('passport');

module.exports = {

  index: function (req, res) {
    res.view();
  },

  logout: function (req, res) {
    req.logout();
    res.redirect('/');
  },

  'github': function (req, res) {
    passport.authenticate('github', { failureRedirect: '/login' },
      function (err, researcher) {
       req.logIn(researcher, function (err) {
         if (err) {
           res.view('500');
           return;
         }

         res.redirect('/');
         return;
       });
     })(req, res);
   },

   'github/callback': function (req, res) {
    passport.authenticate('github',
      function (req, res) {
        res.redirect('/');
      })(req, res);
    }

  };
