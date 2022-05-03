const express = require('express');
const { crewController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/', authMiddleware, crewController.createCrew);
router.delete('/', authMiddleware, crewController.deleteCrewByCrewId);
router.post('/register', authMiddleware, crewController.registerMember);
router.get('/list', authMiddleware, crewController.getAllCrewByUserId);

module.exports = router;
