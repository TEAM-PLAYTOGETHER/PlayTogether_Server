const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, authDao } = require('../db');
const util = require('../lib/util');
const jwtUtil = require('../lib/jwtUtil');
const jwt = require('jsonwebtoken');
const jwtConstants = require('../constants/jwt');
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

const snsLogin = async (snsId, email, provider, name, picture) => {
  let client;
  const log = `authService.snsLogin | userSnsId = ${snsId}`;
  let user;
  let isSignup = false;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 정상적으로 등록된 유저인지 확인
    user = await userDao.getUserBySnsId(client, snsId);
    if (user) {
      user = await authDao.updateSnsUser(client, snsId, email, name, picture);
    }

    if (!user) {
      user = await authDao.createSnsUser(client, snsId, email, provider, name, picture);
    }

    // 회원가입이 완료된 유저인지 확인
    if (user.gender && user.birthDay) {
      isSignup = true;
    }

    const accessToken = jwtUtil.sign(user);
    const refreshToken = jwtUtil.refresh(user);

    redisClient.set(user.id, refreshToken);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { userName: user.name, accessToken: accessToken, refreshToken: refreshToken, isSignup: isSignup });
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
    const refreshResult = jwtUtil.verify(refreshToken);

    // accessToken이 만료 됐을 경우
    if (authResult.message === jwtConstants.TOKEN_EXPIRED || authResult.message === jwtConstants.TOKEN_INVALID) {
      // refreshToken도 만료 됐을 경우
      if (refreshResult.message === jwtConstants.TOKEN_EXPIRED || refreshResult.message === jwtConstants.TOKEN_INVALID) {
        return util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED);
      } else {
        const newAccessToken = jwtUtil.sign(user);

        return util.success(statusCode.OK, responseMessage.CREATED_TOKEN, { accessToken: newAccessToken, refreshToken: refreshToken });
      }
    } else {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_UNEXPIRED);
    }
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
