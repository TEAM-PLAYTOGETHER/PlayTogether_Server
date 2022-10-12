const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, authDao } = require('../db');
const util = require('../lib/util');
const jwtUtil = require('../lib/jwtUtil');
const jwt = require('jsonwebtoken');
const db = require('../loaders/db');

const createSnsUser = async (snsId, email, provider, name, picture) => {
  let client;
  const log = `authService.createSnsUser | snsId = ${snsId}, email = ${email}, provider = ${provider}, name = ${name}, picture = ${picture}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    const newUser = await authDao.createSnsUser(client, snsId, email, provider, name, picture);
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
    if (user.gender && user.birth) {
      isSignup = true;
    }

    const accessToken = jwtUtil.sign(user);
    const refreshToken = jwtUtil.refresh(user);

    await authDao.updateRefreshToken(client, user.id, refreshToken);
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

const refresh = async (accessToken, refreshToken) => {
  let client;
  const log = `authService.refresh | authToken = ${accessToken}, refreshToken = ${refreshToken}`;

  try {
    client = await db.connect(log);

    const user = await authDao.getUserByRefreshToken(client, refreshToken);
    if (!user) {
      return util.fail(statusCode.NOT_FOUND, responseMessage.NO_REFRESH_TOKEN_USER);
    }

    if (accessToken && refreshToken) {
      const accessTokenVerify = jwtUtil.verify(accessToken);
      const refreshTokenVerify = jwtUtil.refreshVerify(refreshToken);
      if (accessTokenVerify === 'jwt expired') {
        // accessToken & refreshToken 둘다 만료됐을 경우 재로그인 요청
        if (refreshTokenVerify === false) {
          return util.fail(statusCode.UNAUTHORIZED, responseMessage.LOGIN_RETRY);

          // refreshToken이 정상적일 경우 accessToken 재발급
        } else {
          const getUser = await userDao.getUserById(client, user.id);
          const newAccessToken = jwtUtil.sign(getUser);

          return util.success(statusCode.OK, responseMessage.CREATED_TOKEN, { accessToken: newAccessToken, refreshToken: refreshToken });
        }
        // accessToken이 만료되지 않았을 경우
      } else {
        return util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_UNEXPIRED);
      }
    } else {
      return util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EMPTY);
    }
  } catch (error) {
    throw new Error('authService refresh에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const withDraw = async (userId) => {
  let client;
  const log = `authService.withDraw | userId = ${userId}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    const isUser = await userDao.getUserById(client, userId);
    if (!isUser) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    await authDao.deleteUser(client, userId);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.DELETE_USER);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('authService withDraw에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

module.exports = {
  createSnsUser,
  snsLogin,
  isUser,
  isSnsUser,
  updateFcmToken,
  refresh,
  withDraw,
};
