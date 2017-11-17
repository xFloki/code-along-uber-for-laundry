const express = require('express');
const laundryController = express.Router();
const User = require('../models/user');
const LaundryPickup = require('../models/laundry-pickup');

laundryController.get('/dashboard', (req, res, next) => {
  let query;

  if (req.session.currentUser.isLaunderer) {
    query = { launderer: req.session.currentUser._id };
  } else {
    query = { user: req.session.currentUser._id };
  }

  LaundryPickup
    .find(query)
    .populate('user', 'name')
    .populate('launderer', 'name')
    .sort('pickupDate')
    .exec((err, pickupDocs) => {
      if (err) {
        next(err);
        return;
      }

      res.render('laundry/dashboard', {
        pickups: pickupDocs
      });
    });
});

laundryController.get('/launderers', (req, res, next) => {
  User.find({ isLaunderer: true })
  .then( launderersList => {
    res.render('laundry/launderers', {
      launderers: launderersList
    });
  })
  .catch(err => {
    next(err);
    return;
  });
});

laundryController.post('/launderers', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const laundererInfo = {
    fee: req.body.fee,
    isLaunderer: true
  };

  User.findByIdAndUpdate(userId, laundererInfo, { new: true })
  .then( theUser => {
    req.session.currentUser = theUser;
    res.redirect('/laundry/dashboard');
  })
  .catch( err => {
    next(err);
    return;
  });
});

laundryController.get('/launderers/:id', (req, res, next) => {
  const laundererId = req.params.id;

  User.findById(laundererId)
  .then(theUser => {
    res.render('laundry/launderer-profile', {
      theLaunderer: theUser
    });
  })
  .catch(err => {
    next(err);
    return;
  });
});

laundryController.post('/laundry-pickups', (req, res, next) => {
  const pickupInfo = {
    pickupDate: req.body.pickupDate,
    launderer: req.body.laundererId,
    user: req.session.currentUser._id
  };

  const thePickup = new LaundryPickup(pickupInfo);

  thePickup.save()
  .then(() => {
    res.redirect('/laundry/dashboard');
  })
  .catch(err => {
    next(err);
    return;
  });
});

module.exports = laundryController;
