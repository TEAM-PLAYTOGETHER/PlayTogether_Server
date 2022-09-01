const express = require('express');
const { crewController } = require('../controller');
const { authMiddleware } = require('../middlewares/jwtAuthorization');

const router = express.Router();

router.post('/', authMiddleware, crewController.createCrew);
router.delete('/', authMiddleware, crewController.deleteCrewByCrewId);
router.delete('/:crewId', authMiddleware, crewController.withDrawCrew);
router.post('/register', authMiddleware, crewController.registerMember);
router.get('/list', authMiddleware, crewController.getAllCrewByUserId);
router.put('/:crewId', authMiddleware, crewController.putCrew);

module.exports = router;
