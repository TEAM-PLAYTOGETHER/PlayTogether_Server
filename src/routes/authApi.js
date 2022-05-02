const express = require('express');
const { authController } = require('../controller');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/usercheck', authController.isUser);

module.exports = router;
