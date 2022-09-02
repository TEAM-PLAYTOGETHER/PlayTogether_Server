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
    const existLight = await lightDao.getExistLight(client, memberId, lightId);
    if (!existLight) {
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
    throw new Error('scrapService addLightScrap에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getLightScrap = async (lightId, memberId) => {
  let client;

  const log = `scrapService.getLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const data = await scrapDao.getLightScrap(client, lightId, memberId);
    return data;
  } catch (error) {
    throw new Error('scrapService getLightScrap error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const deleteLightScrap = async (lightId, memberId) => {
  let client;

  const log = `scrapService.deleteLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 스크랩 한 유저인지 확인
    const scrapExist = await scrapDao.getLightScrapMember(client, lightId, memberId);
    if (!scrapExist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SCRAP);
    }
    await scrapDao.deleteLightScrap(client, lightId, memberId);

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.SCRAP_DELETE_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('scrapService deleteLightScrap error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const existLightScrap = async (lightId, memberId) => {
  let client;

  const log = `lightService.existLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const data = await scrapDao.existLightScrap(client, lightId, memberId);
    // 존재하는 유저인지 확인
    const existUser = await userDao.getUserById(client, memberId);
    if (!existUser) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, memberId, lightId);
    if (!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    if (data) {
      const is_scraped = true;
      return util.success(statusCode.OK, responseMessage.EXIST_SCRAP_LIGHT, is_scraped);
    }
    if (!data) {
      const is_scraped = false;
      return util.fail(statusCode.BAD_REQUEST, responseMessage.EXIST_NOT_SCRAP_LIGHT, is_scraped);
    }
  } catch (error) {
    throw new Error('lightService existLightScrap error 발생: \n' + error);
  } finally {
    client.release();
  }
};

module.exports = {
  addLightScrap,
  getLightScrap,
  deleteLightScrap,
  existLightScrap,
};
