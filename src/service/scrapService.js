const { scrapDao } = require('../db');

const addLightScrap = async (lightId, memberId) => {
  try {
    await scrapDao.addLightScrap(lightId, memberId);
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
    await scrapDao.deleteLightScrap(lightId, memberId);
  } catch (error) {
    console.log('deleteCancelLight error 발생'+ error);
  }
}


module.exports = {
    addLightScrap,
    getLightScrap,
    deleteLightScrap
};
