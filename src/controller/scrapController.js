const { scrapService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const postLightScrap = async (req, res) => {
    const memberId = req.user.id;
    const { lightId } = req.params;
    if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    try {
      const existedScrap = await scrapService.getLightScrap(lightId, memberId);
      if(existedScrap) {
        await scrapService.deleteLightScrap(lightId, memberId);
        return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.SCRAP_DELETE_SUCCESS));    
      }
      const result = await scrapService.addLightScrap(lightId, memberId);
      
      return res.status(result.status).json(result);  
    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    postLightScrap
};