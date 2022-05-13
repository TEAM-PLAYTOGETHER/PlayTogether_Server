const express = require('express');
const { lightController } = require('../controller');
const upload = require('../middlewares/multer');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/add/:crewId', authMiddleware, upload.single('image'), lightController.addLight);
router.put('/:lightId', authMiddleware, lightController.putLight);
router.post('/enter/:lightId', authMiddleware, lightController.postEnterLight);
router.post('/remove/:lightId', authMiddleware, lightController.deleteLight);
router.get('/open', authMiddleware, lightController.getOrganizerLight);
router.get('/enter', authMiddleware, lightController.getEnterLight);
router.get('/scrap', authMiddleware, lightController.getScrapLight);
router.get('/', lightController.getCategoryLight);
router.get('/:lightId', lightController.getLightDetail);

module.exports = router;
