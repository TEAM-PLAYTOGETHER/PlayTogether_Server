const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { userService } = require('../service');

const getUserByUserId = async (req, res) => {
  const { userLoginId } = req.params;

  try {
    if (!userLoginId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 유저 조회
    const getUserByUserLoginId = await userService.getUserByUserLoginId(userLoginId);

    return res.status(getUserByUserLoginId.status).json(getUserByUserLoginId);
  } catch (error) {
    console.log('UserController getUserByUserId error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  getUserByUserId,
};
