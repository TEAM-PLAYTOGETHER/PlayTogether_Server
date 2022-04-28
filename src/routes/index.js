const express = require('express');

const router = express.Router();

router.use('/test', require('./testAPI'));
router.use('/light', require('./lightApi'));

module.exports = router;
