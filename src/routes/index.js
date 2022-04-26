const express = require('express');

const router = express.Router();

router.use('/test', require('./testAPI'));
router.use('/message', require('./messageAPI'));

module.exports = router;
