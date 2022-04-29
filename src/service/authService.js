const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, authDao } = require('../db');
const util = require('../lib/util');
const bcrypt = require('bcrypt');

const createUser = async (userId, password, userName, gender, birth, mbti) => {
  // 이미 존재하는 유저인지 확인
  const isUser = await userDao.getUserById(userId);

  try {
    if (isUser) {
      return util.fail(statusCode.CONFLICT, responseMessage.ALREADY_USER_ID);
    }

    // bcrypt를 이용한 비밀번호 암호화
    const encryptedPassword = bcrypt.hashSync(password, 10);

    const newUser = await authDao.createUser(userId, encryptedPassword, userName, gender, birth, mbti);

    return util.success(statusCode.OK, responseMessage.CREATED_USER, newUser);
  } catch (error) {
    console.log('authService createUser에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createUser,
};
