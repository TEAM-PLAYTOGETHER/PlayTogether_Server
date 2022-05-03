const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao } = require('../db');
const util = require('../lib/util');

const getUserByUserLoginId = async (userLoginId) => {
  const user = await userDao.getUserByUserLoginId(userLoginId);

  try {
    // 해당 유저가 없는 경우
    if (!user) {
      return util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER);
    }

    // 만 나이 계산 로직 -> 따로 분리하는게 좋을지도
    const now = new Date();
    const birth = new Date(user.birthDay);

    let age = now.getFullYear() - birth.getFullYear();
    const month = now.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    const userData = {
      userLoginId: user.userLoginId,
      name: user.name,
      age: age,
      mbti: user.mbti,
    };

    return util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, userData);
  } catch (error) {
    console.log('userService getUserByLoginId에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getUserByUserLoginId,
};
