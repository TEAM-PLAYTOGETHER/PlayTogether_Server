const jwt = require('jsonwebtoken');
const { TOKEN_EXPIRED, TOKEN_INVALID } = require('../constants/jwt');

// JWT를 발급/인증할 때 필요한 secretKey를 설정
const secretKey = process.env.JWT_SECRET;
const options = {
  algorithm: 'HS256',
  expiresIn: '30d',
  issuer: 'playtogether',
};

// id, email, name, idFirebase가 담긴 JWT를 발급
const jwtGenerator = (user) => {
  const payload = {
    id: user.id,
    userLoginId: user.userLoginId,
  };

  return jwt.sign(payload, secretKey, options);
};

// JWT를 해독하고, 해독한 JWT가 우리가 만든 JWT가 맞는지 확인
const jwtVerify = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (err) {
    if (err.message === 'jwt expired') {
      console.log('expired token');
      return TOKEN_EXPIRED;
    } else if (err.message === 'invalid token') {
      console.log('invalid token');
      return TOKEN_INVALID;
    } else {
      console.log('invalid token');
      return TOKEN_INVALID;
    }
  }
  // 해독 / 인증이 완료되면, 해독된 상태의 JWT를 반환합니다.
  return decoded;
};

module.exports = {
  jwtGenerator,
  jwtVerify,
};
