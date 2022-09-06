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
 * GET ~/:crewId
 * 유저 아이디로 유저 조회
 * @public
 */
const getProfileByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crewId } = req.params;

    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    if (!crewId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 유저 조회
    const profile = await userService.getProfileByUserId(userId, crewId);

    return res.status(profile.status).json(profile);
  } catch (error) {
    return next(new Error('getProfileByUserId Controller 에러: \n' + error));
  }
};

/**
 * GET ~/:crewId/:memberId/profile
 * 동아리원 프로필 조회
 * @private
 */
const getMemberProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crewId, memberId } = req.params;

    // 유저 인증 에러
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    // 파라미터 확인
    if (!crewId || !memberId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const memberProfile = await userService.getMemberProfile(userId, crewId, memberId);
    return res.status(memberProfile.status).json(memberProfile);
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

/**
 * PUT ~/:crewId/image
 * 동아리 프로필 이미지 등록
 * @private
 */
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

/**
 * POST ~/block/:memberId
 * 유저 차단
 * @private
 */
const blockUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    // 헤더에 유저 토큰이 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    // 차단할 유저 아이디가 없는 경우
    if (!memberId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 자기 자신을 차단하려 할 때
    if (userId === memberId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.CANNOT_BLOCK_SELF));
    }

    const blockUser = await userService.blockUser(userId, memberId);
    return res.status(blockUser.status).json(blockUser);
  } catch (error) {
    return next(new Error('blockUser Controller 에러: \n' + error));
  }
};

/**
 * DELETE ~/unblock/:memberId
 * 유저 차단 해제
 * @private
 */
const unblockUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    // 헤더에 유저 토큰이 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    // 차단할 유저 아이디가 없는 경우
    if (!memberId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    // 자기 자신을 차단하려 할 때
    if (userId === memberId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.CANNOT_BLOCK_SELF));
    }

    const unblockUser = await userService.unblockUser(userId, memberId);
    return res.status(unblockUser.status).json(unblockUser);
  } catch (error) {
    return next(new Error('unblockUser Controller 에러: \n' + error));
  }
};

/**
 * GET ~/block/list
 * 유저 차단 리스트 조회
 * @private
 */
const getBlockList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 헤더에 유저 토큰이 없을 시 에러 처리
    if (!userId) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED));
    }

    const blockList = await userService.blockList(userId);
    return res.status(blockList.status).json(blockList);
  } catch (error) {
    return next(new Error('unblockUser Controller 에러: \n' + error));
  }
};

module.exports = {
  signup,
  getProfileByUserId,
  getMemberProfile,
  updateUserProfile,
  nicknameCheck,
  updateUserProfileImage,
  blockUser,
  unblockUser,
  getBlockList,
};
