const { scrapDao, lightDao, userDao } = require('../db');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const db = require('../loaders/db');

const addLightScrap = async (lightId, memberId) => {
  let client;

  const log = `scrapService.addLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, lightId);
    if(!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    await scrapDao.addLightScrap(client, lightId, memberId);
    
    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.SCRAP_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('addLightScrap error 발생'+ error);
  } finally {
    client.release();
  }
}
const getLightScrap = async (lightId, memberId) => {
  let client;

  const log = `scrapService.getLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const data = await scrapDao.getLightScrap(client, lightId, memberId);
    return data
  } catch (error) {
    console.log('getLightScrap error 발생'+ error);
  } finally {
    client.release();
  }
}
const deleteLightScrap = async (lightId, memberId) => {
  let client;

  const log = `scrapService.deleteLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 스크랩 한 유저인지 확인
    const scrapExist = await scrapDao.getLightScrapMember(client, lightId, memberId);
    if(!scrapExist){
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SCRAP);
    }
    await scrapDao.deleteLightScrap(client, lightId, memberId);
    
    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.SCRAP_DELETE_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('deleteLightScrap error 발생'+ error);
  } finally {
    client.release();
  }
}


module.exports = {
    addLightScrap,
    getLightScrap,
    deleteLightScrap
};
