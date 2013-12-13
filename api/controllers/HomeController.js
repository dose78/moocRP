module.exports = {

  index: function (req, res) {
    res.view({
      researcher: req.user
    });
  }

};
