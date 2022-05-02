const express = require('express');
const { userController } = require('../controller');

const router = express.Router();

router.get('/:userLoginId', userController.getUserByUserId);

module.exports = router;
