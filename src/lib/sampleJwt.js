const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 테스트용 샘플 jwt 생성
 * @param id: 토큰에 담을 userId
 * @returns 샘플 jwt
 */
const issueSampleToken = (id) => {
  const payload = {
    user: {
      id,
    },
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: '14d',
  });
  return token;
};

module.exports = {
  issueSampleToken,
};
