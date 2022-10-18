const { crewService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

/**
 * POST ~/crew
 * 동아리 만들기
 * @private
 */
const createCrew = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const name = req.body.crewName;
    const description = req.body.description;

    if (!name || !description) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.createCrew(name, userId, description);
    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('createCrew Controller 에러: \n' + error));
  }
};

/**
 * GET ~/crew/checkExist/:crewCode
 * 동아리 가입 가능성 확인
 * @private
 */
const checkCrewRegisterAvailable = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crewCode } = req.params;

    if (!crewCode) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.checkCrewRegisterAvailable(userId, crewCode);
    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('checkCrewRegisterAvailable Controller 에러: \n' + error));
  }
};

/**
 * POST ~/crew/register
 * 동아리 만들기
 * @private
 */
const registerMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const crewCode = req.body.crewCode;

    if (!crewCode) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.registerMember(userId, crewCode);
    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('registerMember Controller 에러: \n' + error));
  }
};

/**
 * GET ~/crew/list
 * 회원이 가입한 동아리 리스트 조회
 * @private
 */
const getAllCrewByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await crewService.getAllCrewByUserId(userId);

    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('getAllCrewByUserId Controller 에러: \n' + error));
  }
};

/**
 * DELETE ~/crew
 * 동아리 삭제 (미사용 API)
 * @private
 */
const deleteCrewByCrewId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crewCode } = req.body;

    if (!crewCode) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.deleteCrewByCrewId(userId, crewCode);
    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('deleteCrewByCrewId Controller 에러: \n' + error));
  }
};

const putCrew = async (req, res, next) => {
  const masterId = req.user.id;
  const { crewId } = req.params;
  const { name, description } = req.body;

  if (!crewId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const updatedPost = await crewService.putCrew(crewId, masterId, name, description);

    if (!updatedPost) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));

    return res.status(updatedPost.status).json(updatedPost);
  } catch (error) {
    return next(new Error('putCrew Controller 에러: \n' + error));
  }
};

/**
 * DELETE ~/crew/:crewId
 * 동아리 탈퇴
 * @private
 */
const withDrawCrew = async (req, res, next) => {
  const userId = req.user.id;
  const { crewId } = req.params;

  // 유저 인증 토큰관련 에러
  if (!userId) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EMPTY));

  // crewId가 없을 경우
  if (!crewId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const withDraw = await crewService.withDrawCrew(userId, crewId);

    return res.status(withDraw.status).json(withDraw);
  } catch (error) {
    return next(new Error('withDraw Controller 에러: \n' + error));
  }
};

module.exports = {
  createCrew,
  checkCrewRegisterAvailable,
  registerMember,
  getAllCrewByUserId,
  deleteCrewByCrewId,
  withDrawCrew,
  putCrew,
};
