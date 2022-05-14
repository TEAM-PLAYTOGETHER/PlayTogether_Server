const express = require('express');

const router = express.Router();

// 유저 관련 라우터
router.use('/auth', require('./authApi'));
router.use('/user', require('./userAPi'));

// 번개 관련 라우터
router.use('/light', require('./lightApi'));

// 메시지 관련 라우터
router.use('/message', require('./messageAPI'));

// 동아리 관련 라우터
router.use('/crew', require('./crewAPI'));

// 스크랩 관련 라우터
router.use('/scrap', require('./scrapApi'));

module.exports = router;
