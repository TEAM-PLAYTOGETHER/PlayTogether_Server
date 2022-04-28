const express = require('express');
const { lightConroller } = require('../controller');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/add/:crewId/:organizerId', upload.single('image'), lightConroller.addLight);

module.exports = router;
