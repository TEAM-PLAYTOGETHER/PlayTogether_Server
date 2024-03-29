// 메시지 관련 dao
const messageDao = require('./messageDao');

// 유저 관련 dao
const authDao = require('./authDao');
const userDao = require('./userDao');
const blockUserDao = require('./blockUserDao');

// 동아리 관련 dao
const crewDao = require('./crewDao');
const crewUserDao = require('./crewUserDao');

// 번개 관련 dao
const lightDao = require('./lightDao');
const lightUserDao = require('./lightUserDao');

// 번개 찜 dao
const scrapDao = require('./scrapDao');

// 번개 신고 dao
const reportLightDao = require('./reportLightDao');

module.exports = {
  authDao,
  userDao,
  blockUserDao,
  lightDao,
  messageDao,
  crewDao,
  crewUserDao,
  lightUserDao,
  scrapDao,
  reportLightDao,
};
