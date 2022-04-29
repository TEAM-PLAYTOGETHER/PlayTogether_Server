const express = require('express');

const router = express.Router();

// 유저 관련 라우터
router.use('/auth', require('./authApi'));

router.use('/test', require('./testAPI'));
router.use('/light', require('./lightApi'));
router.use('/message', require('./messageAPI'));
router.use('/crew', require('./crewAPI'));

module.exports = router;
