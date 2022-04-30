const testService = require('./testService');
const lightService = require('./lightService');
const messageService = require('./messageService');

// 동아리 관련 서비스
const crewService = require('./crewService');

// 유저 관련 서비스
const authService = require('./authService');

// 번개 찜 관련 서비스
const scrapService = require('./scrapService');

module.exports = {
  testService,
  authService,
  messageService,
  lightService,
  crewService,
  scrapService
};
