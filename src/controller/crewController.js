const { crewService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const createCrew = async (req, res) => {
  try {
    const masterId = req.user.id;
    const name = req.body.crewName;

    const result = await crewService.createCrew(name, masterId);
    return res.status(result.status).json(result);
  } catch (error) {
    console.log('createCrew Controller 에러: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  createCrew,
};
