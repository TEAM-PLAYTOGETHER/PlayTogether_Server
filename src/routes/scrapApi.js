const express = require('express');
const { scrapController } = require('../controller');

const router = express.Router();

router.post('/scrap/:lightId/:memberId', scrapController.postLightScrap);

module.exports = router;
