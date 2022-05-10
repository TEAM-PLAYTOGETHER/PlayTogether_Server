const express = require('express');
const { userController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// GET
router.get('/:userLoginId', userController.getUserByUserId);

// POST

// PUT
router.put('/mbti', authMiddleware, userController.updateUserMbti);

// DELETE

module.exports = router;
