const express = require('express');
const uploader = require('../middlewares/imageUpload');
const { userController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// GET
router.get('/:crewId/:userId', userController.getCrewUserById);
router.get('/crew/:crewId/nickname', userController.nicknameCheck);

// POST

// PUT
router.put('/signup', authMiddleware, userController.signup);
router.put('/:crewId', authMiddleware, userController.updateUserProfile);

router.put('/:crewId/image', authMiddleware, uploader.imageUploader.single('image'), userController.updateUserProfileImage);

// DELETE

module.exports = router;
