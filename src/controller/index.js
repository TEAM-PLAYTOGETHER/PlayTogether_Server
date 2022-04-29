const testController = require('./testController');
const lightController = require('./lightController');
const messageController = require('./messageController');
const crewController = require('./crewController');

// 유저 관련 컨트롤러
const authController = require('./authController');

module.exports = {
  testController,
  authController,
  lightController,
  messageController,
  crewController,
};
