const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { userService, crewService } = require('../service');

/**
 * PUT ~/signup
 * 유저 회원가입 시 기본정보 등록
 * @private
 */
const signup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gender, birth } = req.body;

    // 헤더에 유저 토큰 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    // body값이 없을 경우
    if (!gender || !birth) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const updateUser = await userService.signup(userId, gender, birth);

    return res.status(updateUser.status).json(updateUser);
  } catch (error) {
    return next(new Error('signup Controller 에러: \n' + error));
  }
};

/**
 * GET ~/:crewId/:userId
 * 유저 아이디로 유저 조회
 * @public
 */
const getCrewUserById = async (req, res, next) => {
  try {
    const { crewId, userId } = req.params;

    if (!crewId || !userId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 유저 조회
    const getUserById = await userService.getCrewUserById(crewId, userId);

    return res.status(getUserById.status).json(getUserById);
  } catch (error) {
    return next(new Error('getUserByUserId Controller 에러: \n' + error));
  }
};

/**
 * GET ~/:crewId/?nickname=
 * 유저 닉네임 중복확인
 * @public
 */
const nicknameCheck = async (req, res, next) => {
  try {
    const { crewId } = req.params;
    const { nickname } = req.query;

    if (nickname.length === 0 || !nickname) return res.status(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE);

    const isUsedNickname = await userService.getUserByNickname(crewId, nickname);

    return res.status(isUsedNickname.status).json(isUsedNickname);
  } catch (error) {
    return next(new Error('nicknameCheck Controller 에러: \n' + error));
  }
};

/**
 * PUT ~/:crewId
 * 동아리 프로필 생성
 * @private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crewId } = req.params;
    const { nickname, description, firstStation, secondStation } = req.body;

    // 헤더에 유저 토큰이 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    if (!nickname) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.UNUSABLE_NICKNAME));
    }

    const profile = await crewService.updateCrewUserProfile(userId, crewId, nickname, description, firstStation, secondStation);
    return res.status(profile.status).json(profile);
  } catch (error) {
    return next(new Error('updateUserProfile Controller 에러: \n' + error));
  }
};
const updateUserProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crewId } = req.params;
    const image = req.file.location;

    // 헤더에 유저 토큰이 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    const profile = await crewService.updateCrewUserProfileImage(userId, crewId, image);
    return res.status(profile.status).json(profile);
  } catch (error) {
    return next(new Error('updateUserProfile Controller 에러: \n' + error));
  }
};

module.exports = {
  signup,
  getCrewUserById,
  updateUserProfile,
  nicknameCheck,
  updateUserProfileImage,
};
