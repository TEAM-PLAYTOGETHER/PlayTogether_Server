const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const { userService, crewService } = require('../service');

/**
 * GET ~/:userLoginId
 * 유저 아이디로 유저 조회
 * @public
 */
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

/**
 * PUT ~/mbti
 * 유저 mbti 추가
 * @private
 */
const updateUserMbti = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mbti } = req.body;

    // 헤더에 유저 토큰 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
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

/**
 * GET ~/:crewId/?nickname=
 * 유저 닉네임 중복확인
 * @public
 */
const nicknameCheck = async (req, res) => {
  try {
    const { crewId } = req.params;
    const { nickname } = req.query;

    if (!nickname) return res.status(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE);

    const isUsedNickname = await userService.getUserByNickname(crewId, nickname);

    return res.status(isUsedNickname.status).json(isUsedNickname);
  } catch (error) {
    console.log('UserController updateUserMbti error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

/**
 * PUT ~/:crewId
 * 동아리 프로필 생성
 * @private
 */
const updateUserProfile = async (req, res) => {
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
    console.log('UserController updateUserProfile error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  getUserByUserId,
  updateUserMbti,
  updateUserProfile,
  nicknameCheck,
};
