const express = require('express');
const { messageController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

// TODO: auth 미들웨어 중간에 추가
router.post('/', messageController.sendMessage);
router.get('/', authMiddleware, messageController.getAllMessageById);

module.exports = router;
