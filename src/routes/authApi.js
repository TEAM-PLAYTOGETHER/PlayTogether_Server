const express = require('express');
const passport = require('passport');
const { authController } = require('../controller');

const router = express.Router();

// GET
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

router.get('/refresh', authController.refresh);

// POST
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/usercheck', authController.isUser);

// PUT

// DELETE

module.exports = router;
