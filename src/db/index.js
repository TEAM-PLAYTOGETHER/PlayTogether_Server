const testDao = require('./testDao');
const lightDao = require('./lightDao');

// 메시지 관련 dao
const messageDao = require('./messageDao');

// 유저 관련 dao
const authDao = require('./authDao');
const userDao = require('./userDao');

// 동아리 관련 dao
const crewDao = require('./crewDao');

module.exports = {
  testDao,
  authDao,
  userDao,
  lightDao,
  messageDao,
  crewDao,
};
