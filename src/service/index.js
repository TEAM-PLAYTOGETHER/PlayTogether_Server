const testService = require('./testService');
const lightService = require('./lightService');
const messageService = require('./messageService');

// 유저 관련 서비스
const authService = require('./authService');

module.exports = {
  testService,
  authService,
  messageService,
  lightService,
};
