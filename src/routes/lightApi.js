const express = require('express');
const { lightController } = require('../controller');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/add/:crewId/:organizerId', upload.single('image'), lightController.addLight);
router.put('/:lightId', lightController.putLight);

module.exports = router;
