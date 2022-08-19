const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, authDao } = require('../db');
const util = require('../lib/util');
const bcrypt = require('bcrypt');
const jwtUtil = require('../lib/jwtUtil');
const jwt = require('jsonwebtoken');
const redisClient = require('../lib/redis');
const db = require('../loaders/db');

const createSnsUser = async (snsId, email, provider, name) => {
  let client;
  const log = `authService.createSnsUser | snsId = ${snsId}, email = ${email}, provider = ${provider}, name = ${name}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    const newUser = await authDao.createSnsUser(client, snsId, email, provider, name);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.CREATED_USER, newUser);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('authService createSnsUser에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const snsLogin = async (snsId, email, provider, name) => {
  let client;
  const log = `authService.snsLogin | userSnsId = ${snsId}`;
  let user;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 정상적으로 등록된 유저인지 확인
    user = await userDao.getUserBySnsId(client, snsId);

    if (!user) {
      user = await authDao.createSnsUser(client, snsId, email, provider, name);
    }

    const accessToken = jwtUtil.sign(user);
    const refreshToken = jwtUtil.refresh();

    redisClient.set(user.id, refreshToken);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { userName: isSnsUser.name, accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('authService snsLogin에서 error 발생: \n', error);
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
    throw new Error('authService isUser에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const isSnsUser = async (snsId) => {
  let client;
  const log = `authService.isSnsUser | snsId = ${snsId}`;

  try {
    client = await db.connect(log);

    const userExist = await userDao.getUserBySnsId(client, snsId);
    if (!userExist) null;

    return util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, userExist);
  } catch (error) {
    throw new Error('authService isSnsUser에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const updateFcmToken = async (snsId, fcmToken) => {
  let client;
  const log = `authService.saveFcmToken | snsId = ${snsId}, fcmToken = ${fcmToken}`;

  try {
    client = await db.connect(log);

    const saveFcmToken = await authDao.updateFcmToken(client, snsId, fcmToken);
    if (!saveFcmToken) {
      return util.fail(statusCode.DB_ERROR, responseMessage.DB_ERROR);
    }

    return util.success(statusCode.OK, responseMessage.UPDATE_DEVICE_TOKEN_SUCCESS);
  } catch (error) {
    throw new Error('authService saveFcmToken에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const refresh = async (user, authToken, refreshToken) => {
  // access token과 refresh token의 존재여부 확인
  if (authToken && refreshToken) {
    // access token 검증
    const authResult = jwtUtil.verify(authToken);

    // 유저 정보
    const decoded = jwt.decode(authToken);

    if (!decoded) {
      return util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED);
    }
    // refresh token 검증
    const refreshResult = jwtUtil.refreshVerify(refreshToken, decoded.id);

    if (authResult.ok === false && authResult.message === 'jwt expired') {
      // 1. access token & refresh token 모두 만료된 경우 새로 로그인
      if (refreshResult.ok === false) {
        return util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED);
      } else {
        // 2. access token만 만료되었을 경우
        const newAccessToken = jwtUtil.sign(user);

        return util.success(statusCode.OK, responseMessage.CREATED_TOKEN, { accessToken: newAccessToken, refreshToken: refreshToken });
      }
    } else {
      // 3. access token이 만료되지 않았을 때
      return util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_UNEXPIRED);
    }
  } else {
    // 헤더에 토큰이 없는 경우
    return util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_EMPTY);
  }
};

module.exports = {
  createSnsUser,
  snsLogin,
  isUser,
  isSnsUser,
  updateFcmToken,
  refresh,
};
