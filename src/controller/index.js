const testController = require('./testController');
const lightConroller = require('./lightController');
const messageController = require('./messageController');

// 유저 관련 컨트롤러
const authController = require('./authController');

module.exports = {
  testController,
  authController,
  lightConroller,
  messageController,
};
