const express = require('express');

const router = express.Router();

// 유저 관련 라우터
router.use('/auth', require('./authApi'));
router.use('/user', require('./userAPi'));

router.use('/test', require('./testAPI'));
router.use('/light', require('./lightApi'));
router.use('/message', require('./messageAPI'));
router.use('/crew', require('./crewAPI'));

// 스크랩 관련 라우터
router.use('/scrap', require('./scrapApi'));

module.exports = router;
