const testController = require('./testController');
const lightController = require('./lightController');
const messageController = require('./messageController');
const crewController = require('./crewController');

// 유저 관련 컨트롤러
const authController = require('./authController');
const userController = require('./userController');

// 스크랩 관련 컨트롤러
const scrapController = require('./scrapController');

module.exports = {
  testController,
  authController,
  userController,
  lightController,
  messageController,
  crewController,
  scrapController,
};
