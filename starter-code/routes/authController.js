const express = require('express');
const authController = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();
const bcryptSalt = 10;

authController.get('/signup', (req,res) => {
  res.render('auth/signup', {errorMessage : ''});
});

authController.post('/signup', (req, res, next) => {
  const {name, email, password} = req.body;

  if (email === '' || password === '') {
    res.render('auth/signup', {
      errorMessage: 'Enter both email and password to sign up.'
    });
    return;
  }

  User.findOne({email}, '_id')
  .then(existingUser => {
    if (existingUser !== null) throw new Error (`The email ${email} is already in use.`);
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashedPass = bcrypt.hashSync(password, salt);

    const userSubmission = {
      name,
      email,
      password: hashedPass
    };

    const theUser = new User(userSubmission);

    theUser.save()
    .then(() => {
      res.redirect('/');
    })
    .catch(e => {
      throw new Error('Something went wrong. Try again later.')
    });
  })
  .catch(e => {
    res.render('auth/signup', {
      errorMessage: e.message,
    });
  });
});

authController.get('/login', (req, res, next) => {
  res.render('auth/login', {
    errorMessage: ''
  });
});

authController.post('/login', (req, res, next) => {
  const {email,password} = req.body;

  if (email === '' || password=== '') {
    res.render('auth/login', {
      errorMessage: 'Enter both email and password to log in.'
    });
    return;
  }

  User.findOne({ email})
  .then(user => {
    if(!user) throw new Error(`There isn't an account with email ${email}.`);
    if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      res.redirect('/');
    } else {
      throw new Error('Invalid Password');
    }
  })
  .catch(e => {
    return res.render('auth/login', {
      errorMessage: e.message,
    });
  });
});

authController.get('/logout', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/');
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/');
  });
});


module.exports = authController;
