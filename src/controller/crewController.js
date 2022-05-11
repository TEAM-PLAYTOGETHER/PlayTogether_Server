const { crewService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

/**
 * POST ~/crew
 * 동아리 만들기
 * @private
 */
const createCrew = async (req, res) => {
  try {
    const userId = req.user.id;
    const name = req.body.crewName;

    if (!name) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.createCrew(name, userId);
    return res.status(result.status).json(result);
  } catch (error) {
    console.log('createCrew Controller 에러: ' + error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

/**
 * POST ~/crew/register
 * 동아리 만들기
 * @private
 */
const registerMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const crewCode = req.body.crewCode;

    if (!crewCode) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.registerMember(userId, crewCode);
    return res.status(result.status).json(result);
  } catch (error) {
    console.log('registerMember Controller 에러: ' + error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

/**
 * GET ~/crew/list
 * 회원이 가입한 동아리 리스트 조회
 * @private
 */
const getAllCrewByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await crewService.getAllCrewByUserId(userId);

    return res.status(result.status).json(result);
  } catch (error) {
    console.log('registerMember Controller 에러: ' + error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

/**
 * DELETE ~/crew
 * 동아리 삭제 (미사용 API)
 * @private
 */
const deleteCrewByCrewId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { crewCode } = req.body;

    if (!crewCode) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await crewService.deleteCrewByCrewId(userId, crewCode);
    return res.status(result.status).json(result);
  } catch (error) {
    console.log('deleteCrewByCrewId Controller 에러: ' + error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  createCrew,
  registerMember,
  getAllCrewByUserId,
  deleteCrewByCrewId,
};
