// 메시지 관련 dao
const messageDao = require('./messageDao');

// 유저 관련 dao
const authDao = require('./authDao');
const userDao = require('./userDao');

// 동아리 관련 dao
const crewDao = require('./crewDao');
const crewUserDao = require('./crewUserDao');

// 번개 관련 dao
const lightDao = require('./lightDao');
const lightUserDao = require('./lightUserDao');

// 번개 찜 dao
const scrapDao = require('./scrapDao');

module.exports = {
  authDao,
  userDao,
  lightDao,
  messageDao,
  crewDao,
  crewUserDao,
  lightUserDao,
  scrapDao,
};
