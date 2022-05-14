const jwt = require('jsonwebtoken');

const db = require('../loaders/db');
const config = require('../config');
const util = require('../lib/util');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao } = require('../db');

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
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userDao.getUserById(client, decoded.id);

    // decoded된 userId가 가르키는 회원이 없는 경우
    if (!user) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_USER));
    }

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
  authMiddleware,
};
