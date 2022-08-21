const express = require('express');
const { lightController } = require('../controller');
const uploader = require('../middlewares/imageUpload');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/add/:crewId', authMiddleware, uploader.imageUploader.array('image', 3), lightController.addLight);
router.put('/:lightId', authMiddleware, lightController.putLight);
router.post('/enter/:lightId', authMiddleware, lightController.postEnterLight);
router.post('/remove/:lightId', authMiddleware, lightController.deleteLight);
router.get('/:crewId/open', authMiddleware, lightController.getOrganizerLight);
router.get('/:crewId/enter', authMiddleware, lightController.getEnterLight);
router.get('/:crewId/scrap', authMiddleware, lightController.getScrapLight);
router.get('/:crewId/new', authMiddleware, lightController.getNewLight);
router.get('/:crewId/search', authMiddleware, lightController.getSearchLight);
router.get('/:crewId/hot', authMiddleware, lightController.getHotLight);
router.get('/:crewId', lightController.getCategoryLight);
router.get('/:lightId', lightController.getLightDetail);
router.get('/exist/:lightId', authMiddleware, lightController.ExistLightUser);

module.exports = router;
