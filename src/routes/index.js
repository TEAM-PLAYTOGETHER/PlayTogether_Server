const express = require('express');

const router = express.Router();

router.use('/test', require('./testAPI'));

module.exports = router;
