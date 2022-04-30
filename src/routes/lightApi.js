const express = require('express');
const { lightController } = require('../controller');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/add/:crewId/:organizerId', upload.single('image'), lightController.addLight);
router.put('/:lightId', lightController.putLight);
router.post('/enter/:lightId/:memberId', lightController.postEnterLight);

module.exports = router;
