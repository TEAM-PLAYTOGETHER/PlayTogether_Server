const express = require('express');
const { lightConroller } = require('../controller');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/add/:crewId/:organizerId', upload.single('image'), lightConroller.addLight);
router.put('/:lightId', lightConroller.putLight);
router.post('/enter/:lightId/:memberId', lightConroller.postEnterLight);

module.exports = router;
