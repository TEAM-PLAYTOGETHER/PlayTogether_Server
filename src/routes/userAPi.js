const express = require('express');
const { userController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// GET
router.get('/:userLoginId', userController.getUserByUserId);
router.get('/crew/:crewId', userController.nicknameCheck);

// POST

// PUT
router.put('/mbti', authMiddleware, userController.updateUserMbti);
router.put('/:crewId', authMiddleware, userController.updateUserProfile);

// DELETE

module.exports = router;
