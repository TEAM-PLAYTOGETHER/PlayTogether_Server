const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, authDao } = require('../db');
const util = require('../lib/util');
const bcrypt = require('bcrypt');
const { jwtGenerator } = require('../lib/jwtHandler');
const db = require('../loaders/db');

const createUser = async (userLoginId, password, userName, gender, birth) => {
  let client;
  const log = `authService.createUser | userLoginId = ${userLoginId}, password = ${password}, userName = ${userName}, gender = ${gender}, birth = ${birth}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 이미 존재하는 유저인지 확인
    const isUser = await userDao.getUserByUserLoginId(client, userLoginId);

    if (isUser) {
      return util.fail(statusCode.CONFLICT, responseMessage.ALREADY_USER_ID);
    }

    // bcrypt를 이용한 비밀번호 암호화
    const encryptedPassword = bcrypt.hashSync(password, 10);

    const newUser = await authDao.createUser(client, userLoginId, encryptedPassword, userName, gender, birth);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.CREATED_USER, newUser);
  } catch (error) {
    console.log('authService createUser에서 error 발생: ' + error);
    await client.query('ROLLBACK');
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
};

const login = async (userLoginId, password) => {
  let client;
  const log = `authService.login | userLoginId = ${userLoginId}`;

  try {
    client = await db.connect(log);

    // 유저가 존재하는지 확인
    const isUser = await userDao.getUserByUserLoginId(client, userLoginId);

    if (!isUser) {
      return util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER);
    }

    // bcrypt로 암호화된 비밀번호 비교
    const passwordCheck = bcrypt.compareSync(password, isUser.password);

    if (!passwordCheck) {
      return util.fail(statusCode.UNAUTHORIZED, responseMessage.MISS_MATCH_PW);
    }

    // jwt 토큰 생성
    const jwtToken = jwtGenerator(isUser);

    return util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { userLoginId: isUser.userLoginId, userName: isUser.name, jwtToken });
  } catch (error) {
    console.log('authService login에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
};

const isUser = async (userLoginId) => {
  let client;
  const log = `authService.isUser | userLoginId = ${userLoginId}`;

  try {
    client = await db.connect(log);

    const userExist = await userDao.getUserByUserLoginId(client, userLoginId);

    if (userExist) {
      return util.success(statusCode.OK, responseMessage.ALREADY_ID, { isUser: true });
    }

    return util.success(statusCode.OK, responseMessage.USEABLE_ID, { isUser: false });
  } catch (error) {
    console.log('authService isUser에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
};

module.exports = {
  createUser,
  login,
  isUser,
};
