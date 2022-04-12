const express = require('express');
const { testController } = require('../controller');

const router = express.Router();

router.use('/login', testController.testLogin);
router.use('/signup', testController.testSignup);

module.exports = router;
