const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const redisClient = require('./redis');
const secret = process.env.JWT_SECRET;
const { TOKEN_EXPIRED, TOKEN_INVALID } = require('../constants/jwt');

const accessTokenOptions = {
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'playtogether',
};

const refreshTokenOptions = {
  algorithm: 'HS256',
  expiresIn: '14d',
  issuer: 'playtogether',
};

// access token 발급
const sign = (user) => {
  const payload = {
    id: user.id,
    userLoginId: user.userLoginId,
  };

  return jwt.sign(payload, secret, accessTokenOptions);
};

const verify = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    if (error.message === 'jwt expired') {
      console.log('expired token');
      return TOKEN_EXPIRED;
    } else if (error.message === 'invalid token') {
      console.log('invalid token');
      return TOKEN_INVALID;
    } else {
      console.log('invalid token');
      return TOKEN_INVALID;
    }
  }

  return decoded;
};

const refresh = () => {
  return jwt.sign({}, secret, refreshTokenOptions);
};

const refreshVerify = async (token, userId) => {
  /*
  redis 모듈은 기본적으로 promise를 반환하지 않습니다.
  promisify를 이용하여 promise를 반환하게 해줍니다.
  */
  const getAsync = promisify(redisClient.get).bind(redisClient);

  try {
    const data = await getAsync(userId);
    if (token === data) {
      try {
        jwt.verify(token, secret);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  sign,
  verify,
  refresh,
  refreshVerify,
};
