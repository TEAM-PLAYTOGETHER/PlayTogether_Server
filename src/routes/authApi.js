const express = require('express');
const { authController } = require('../controller');

const router = express.Router();

router.post('/signup', authController.signup);

module.exports = router;
