const express = require('express');
const { messageController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/', authMiddleware, messageController.getAllMessageById);

router.get('/:roomId', authMiddleware, messageController.getAllMessageByRoomId);

module.exports = router;
