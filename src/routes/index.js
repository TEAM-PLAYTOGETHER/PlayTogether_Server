const express = require('express');

const router = express.Router();

// 유저 관련 라우터
router.use('/auth', require('./authAPI'));
router.use('/user', require('./userAPI'));

// 번개 관련 라우터
router.use('/light', require('./lightAPI'));

// 메시지 관련 라우터
router.use('/message', require('./messageAPI'));

// 동아리 관련 라우터
router.use('/crew', require('./crewAPI'));

// 스크랩 관련 라우터
router.use('/scrap', require('./scrapAPI'));

module.exports = router;
