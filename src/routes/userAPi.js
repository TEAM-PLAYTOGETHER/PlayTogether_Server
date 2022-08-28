const express = require('express');
const uploader = require('../middlewares/imageUpload');
const { userController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// GET
router.get('/:userLoginId', userController.getUserByUserId);
router.get('/crew/:crewId', userController.nicknameCheck);

// POST

// PUT
router.put('/signup', authMiddleware, userController.signup);
router.put('/mbti', authMiddleware, userController.updateUserMbti);
router.put('/:crewId', authMiddleware,  uploader.imageUploader.single('image'), userController.updateUserProfile);

// DELETE

module.exports = router;
