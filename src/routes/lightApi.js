const express = require('express');
const { lightController } = require('../controller');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/add/:crewId/:organizerId', upload.single('image'), lightController.addLight);
router.put('/:lightId/:organizerId', lightController.putLight);
router.post('/enter/:lightId/:memberId', lightController.postEnterLight);
router.post('/remove/:lightId/:organizerId', lightController.deleteLight);
router.get('/open/:organizerId', lightController.getOrganizerLight);
router.get('/enter/:memberId', lightController.getEnterLight);
router.get('/scrap/:memberId', lightController.getScrapLight);
router.get('/', lightController.getCategoryLight);
router.get('/:lightId', lightController.getLightDetail);

module.exports = router;
