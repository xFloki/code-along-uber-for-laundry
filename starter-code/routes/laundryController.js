const express = require('express');
const User = require('../models/user');
const laundryController = express.Router();
const isLogged = require('../middlewares/isLogged');


laundryController.get('/dashboard', (req, res) => {
  res.render('laundry/dashboard');
});

laundryController.post('/launderers', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const laundererInfo = {
    fee: req.body.fee,
    isLaunderer: true
  };

  User.findByIdAndUpdate(userId, laundererInfo, { new: true }, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

    req.session.currentUser = theUser;

    res.redirect('/laundry/dashboard');
  });
});

module.exports = laundryController;
