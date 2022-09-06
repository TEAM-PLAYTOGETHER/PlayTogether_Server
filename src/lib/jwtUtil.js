const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const db = require('../loaders/db');
const { authDao } = require('../db');

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
    email: user.email,
  };

  return jwt.sign(payload, secret, accessTokenOptions);
};

const verify = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return error.message;
  }
};

const refresh = () => {
  return jwt.sign({}, secret, refreshTokenOptions);
};

const refreshVerify = async (token) => {
  let client;
  const log = `jwtUtil.refreshVerify | token = ${token}`;

  try {
    client = await db.connect(log);

    const dbRefreshToken = await authDao.getUserByRefreshToken(client, token);
    if (token === dbRefreshToken.refreshToken) {
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
  } finally {
    client.release();
  }
};

module.exports = {
  sign,
  verify,
  refresh,
  refreshVerify,
};
