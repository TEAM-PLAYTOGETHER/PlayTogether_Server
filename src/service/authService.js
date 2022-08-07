const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, authDao } = require('../db');
const util = require('../lib/util');
const bcrypt = require('bcrypt');
const jwtUtil = require('../lib/jwtUtil');
const jwt = require('jsonwebtoken');
const redisClient = require('../lib/redis');
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
    console.log('authService createSnsUser에서 error 발생: ' + error);
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
    const accessToken = jwtUtil.sign(isUser);
    const refreshToken = jwtUtil.refresh();

    redisClient.set(isUser.id, refreshToken);

    return util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { userLoginId: isUser.userLoginId, userName: isUser.name, accessToken: accessToken, refreshToken: refreshToken });
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

const isSnsUser = async (snsId, provider) => {
  let client;
  const log = `authService.isSnsUser | snsId = ${snsId}`;

  try {
    client = await db.connect(log);

    const userExist = await userDao.getUserBySnsId(client, snsId, provider);
    if (!userExist) null;

    return util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, userExist);
  } catch (error) {
    console.log('authService isSnsUser에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
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
  createUser,
  createSnsUser,
  login,
  isUser,
  isSnsUser,
  refresh,
};
