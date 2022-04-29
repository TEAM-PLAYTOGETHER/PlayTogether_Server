const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { authService } = require('../service');

const signup = async (req, res) => {
  try {
    const { userId, password, userName, gender, birth, mbti } = req.body;

    // 유저 정보 미 입력시 에러 처리
    if (!userId || !password || !userName || !gender || !birth || !mbti) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const newUser = await authService.createUser(userId, password, userName, gender, birth, mbti);

    return res.status(newUser.status).json(newUser);
  } catch (error) {
    console.log('AuthController signup error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  signup,
};
