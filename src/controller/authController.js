const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { authService } = require('../service');

const login = async (req, res) => {
  try {
    const { userLoginId, password } = req.body;

    if (!userLoginId || !password) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 로그인
    const login = await authService.login(userLoginId, password);

    return res.status(login.status).json(login);
  } catch (error) {
    console.log('AuthController login error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

const signup = async (req, res) => {
  try {
    const { userLoginId, password, userName, gender, birth } = req.body;

    // 유저 정보 미 입력시 에러 처리
    if (!userLoginId || !password || !userName || !gender || !birth) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // TODO: 길이 이외의 로직 추가 시 service단으로 분리
    if (password.length < 8 || password.length > 15) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_AVAILABLE_PASSWORD));
    }

    // 유저 생성
    const newUser = await authService.createUser(userLoginId, password, userName, gender, birth);

    return res.status(newUser.status).json(newUser);
  } catch (error) {
    console.log('AuthController signup error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

const isUser = async (req, res) => {
  try {
    const { userLoginId } = req.body;

    // 유저 아이디 입력 시 에러 처리
    if (!userLoginId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const userExist = await authService.isUser(userLoginId);

    return res.status(userExist.status).json(userExist);
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  signup,
  login,
  isUser,
};
