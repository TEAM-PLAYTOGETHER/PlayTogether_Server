const testDao = require('./testDao');
const lightDao = require('./lightDao');
const messageDao = require('./messageDao');

// 유저 관련 dao
const authDao = require('./authDao');
const userDao = require('./userDao');

module.exports = {
  testDao,
  authDao,
  userDao,
  lightDao,
  messageDao,
};
