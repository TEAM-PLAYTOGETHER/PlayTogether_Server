// 메시지 관련 컨트롤러
const messageController = require('./messageController');

// 동아리 관련 컨트롤러
const crewController = require('./crewController');

// 유저 관련 컨트롤러
const authController = require('./authController');
const userController = require('./userController');

// 번개 관련 컨트롤러
const lightController = require('./lightController');
const scrapController = require('./scrapController');

module.exports = {
  authController,
  userController,
  lightController,
  messageController,
  crewController,
  scrapController,
};
