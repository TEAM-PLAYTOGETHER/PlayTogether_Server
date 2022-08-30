const express = require('express');
const { scrapController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/:lightId', authMiddleware, scrapController.postLightScrap);
router.get('/exist/:lightId', authMiddleware, scrapController.existLightScrap);

module.exports = router;
