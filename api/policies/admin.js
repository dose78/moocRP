module.exports = function (req, res, next) {
  if (req.user.admin) {
    return next();
  } else {
    return res.redirect('/');
  }
};
