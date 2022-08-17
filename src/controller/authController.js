const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { authService } = require('../service');

const login = async (req, res, next) => {
  try {
    const { userLoginId, password } = req.body;

    if (!userLoginId || !password) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 로그인
    const login = await authService.login(userLoginId, password);

    return res.status(login.status).json(login);
  } catch (error) {
    return next(new Error('AuthController login error 발생: \n' + error));
  }
};

const signup = async (req, res, next) => {
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
    return next(new Error('AuthController signup error 발생: \n' + error));
  }
};

const isUser = async (req, res, next) => {
  try {
    const { userLoginId } = req.body;

    // 유저 아이디 입력 시 에러 처리
    if (!userLoginId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const userExist = await authService.isUser(userLoginId);

    return res.status(userExist.status).json(userExist);
  } catch (error) {
    return next(new Error('AuthController isUser error 발생: \n' + error));
  }
};

const refresh = async (req, res, next) => {
  try {
    const user = req.user;
    const authToken = req.headers.authorization;
    const refreshToken = req.headers.refresh;

    const refresh = await authService.refresh(user, authToken, refreshToken);

    return res.status(refresh.status).json(refresh);
  } catch (error) {
    return next(new Error('AuthController refresh error 발생: \n' + error));
  }
};

module.exports = {
  signup,
  login,
  isUser,
  refresh,
};
