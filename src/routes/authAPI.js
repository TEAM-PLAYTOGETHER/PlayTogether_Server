const express = require('express');
const passport = require('passport');
const { authController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// GET
router.get('/refresh', authController.refresh);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

// POST
router.post('/google-login', authController.googleLogin);
router.post('/kakao-login', authController.kakaoLogin);
router.post('/apple-login', authController.appleLogin);

// PUT

// DELETE
router.delete('/withdraw', authMiddleware, authController.withDraw);

module.exports = router;
