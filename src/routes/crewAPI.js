const express = require('express');
const { crewController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/', authMiddleware, crewController.createCrew);

module.exports = router;