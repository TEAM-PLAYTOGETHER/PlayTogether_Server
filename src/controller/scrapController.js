const { scrapService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const postLightScrap = async (req, res, next) => {
  const memberId = req.user.id;
  const { lightId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  try {
    const existedScrap = await scrapService.getLightScrap(lightId, memberId);
    if (existedScrap) {
      await scrapService.deleteLightScrap(lightId, memberId);
      return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.SCRAP_DELETE_SUCCESS));
    }
    const result = await scrapService.addLightScrap(lightId, memberId);

    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('postLightScrap Controller 에러: \n' + error));
  }
};
const existLightScrap = async (req, res, next) => {
  const memberId = req.user.id;
  const { lightId } = req.params;

  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT));

  try {
    const lights = await scrapService.existLightScrap(lightId, memberId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('existLightScrap Controller 에러: \n' + error));
  }
};

module.exports = {
  postLightScrap,
  existLightScrap
};
