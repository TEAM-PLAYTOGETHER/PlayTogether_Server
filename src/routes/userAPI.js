const express = require('express');
const uploader = require('../middlewares/imageUpload');
const { userController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// GET
router.get('/:crewId', authMiddleware, userController.getProfileByUserId);
router.get('/:crewId/:memberId/profile', authMiddleware, userController.getMemberProfile);
router.get('/crew/:crewId/nickname', userController.nicknameCheck);
router.get('/block/list', authMiddleware, userController.getBlockList);

// POST
router.post('/block/:memberId', authMiddleware, userController.blockUser);

// PUT
router.put('/signup', authMiddleware, userController.signup);
router.put('/:crewId', authMiddleware, userController.updateUserProfile);

router.put('/:crewId/image', authMiddleware, uploader.imageUploader.single('image'), userController.updateUserProfileImage);

// DELETE
router.delete('/unblock/:memberId', authMiddleware, userController.unblockUser);

module.exports = router;
