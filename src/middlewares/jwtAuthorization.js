const db = require('../loaders/db');
const util = require('../lib/util');
const jwtUtil = require('../lib/jwtUtil');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');

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
    const user = jwtUtil.verify(token);

    if (user === 'jwt expired') {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
    }

    if (user === 'jwt invalid') {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
    }

    // req.user에 담아서 next()
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  } finally {
    client.release();
  }
};

module.exports = {
  authMiddleware,
};
