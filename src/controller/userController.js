const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { userService } = require('../service');

const getUserByUserId = async (req, res) => {
  try {
    const { userLoginId } = req.params;

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

const updateUserMbti = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mbti } = req.body;

    // 헤더에 유저 토큰 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.UNAUTHORIZED));
    }

    // mbit값 없을 시 에러 처리
    if (!mbti) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const updateUser = await userService.updateUserMbti(userId, mbti);

    return res.status(updateUser.status).json(updateUser);
  } catch (error) {
    console.log('UserController updateUserMbti error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  getUserByUserId,
  updateUserMbti,
};
