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

module.exports = {
  createCrew,
  registerMember,
  getAllCrewByUserId,
  deleteCrewByCrewId,
};
