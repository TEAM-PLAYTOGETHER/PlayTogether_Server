const express = require('express');
const { messageController } = require('../controller');

const router = express.Router();

// TODO: auth 미들웨어 중간에 추가
router.post('/', messageController.sendMessage);

module.exports = router;
