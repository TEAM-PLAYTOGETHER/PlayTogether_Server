const jwt = require('jsonwebtoken');
const db = require('../loaders/db');
const config = require('../config');
const util = require('../lib/util');
const jwtUtil = require('../lib/jwtUtil');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao } = require('../db');

const getUserIdByToken = (accessToken) => {
  try {
    const decoded = jwtUtil.verify(accessToken);

    return decoded.decoded.id;
  } catch (e) {
    return null;
  }
};

const authMiddleware = async (req, res, next) => {
  let client;
  const log = `authMiddleware`;
  // 토큰이 없는 경우
  if (req.headers.authorization === '' || req.headers.authorization === null || req.headers.authorization === undefined) {
    return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EMPTY));
  }

  try {
    client = await db.connect(log);
    const token = req.headers.authorization;
    const refreshToken = req.headers.refresh;
    let userId = getUserIdByToken(token);

    const existUser = await userDao.getUserById(client, userId);
    if (!existUser) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }
    if (!userId) {
      userId = getUserIdByToken(refreshToken);
      if (!userId) {
        return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.LOGIN_RETRY));
      }
    }
    const user = await userDao.getUserById(client, userId);

    // req.user에 담아서 next()
    req.user = user;
    next();
  } catch (err) {
    if (err.message === 'jwt expired') {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
    } else {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
    }
  } finally {
    client.release();
  }
};

module.exports = {
  getUserIdByToken,
  authMiddleware,
};
