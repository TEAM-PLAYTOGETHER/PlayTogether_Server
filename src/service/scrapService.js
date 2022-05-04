const { scrapDao, lightDao, userDao } = require('../db');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const addLightScrap = async (lightId, memberId) => {
  try {
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(lightId);
    if(!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    await scrapDao.addLightScrap(lightId, memberId);
    
    return util.success(statusCode.OK, responseMessage.SCRAP_SUCCESS);
  } catch (error) {
    console.log('postEnterLight error 발생'+ error);
  }
}
const getLightScrap = async (lightId, memberId) => {
  try {
    const data = await scrapDao.getLightScrap(lightId, memberId);
    return data
  } catch (error) {
    console.log('getEnterLightMember error 발생'+ error);
  }
}
const deleteLightScrap = async (lightId, memberId) => {
  try {
    // 스크랩 한 유저인지 확인
    const scrapExist = await scrapDao.getLightScrapMember(lightId, memberId);
    if(!scrapExist){
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SCRAP);
    }
    await scrapDao.deleteLightScrap(lightId, memberId);
    
    return util.success(statusCode.OK, responseMessage.SCRAP_DELETE_SUCCESS);
  } catch (error) {
    console.log('deleteCancelLight error 발생'+ error);
  }
}


module.exports = {
    addLightScrap,
    getLightScrap,
    deleteLightScrap
};
