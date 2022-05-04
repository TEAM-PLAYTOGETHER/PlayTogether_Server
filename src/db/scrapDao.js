const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');
const db = require('../loaders/db');


const addLightScrap = async (lightId, memberId) => {
  let client;

  const log = `scrapDao.addLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      INSERT INTO scrap
      (light_id, member_id, created_at, updated_at)
      VALUES
      ($1, $2, now(), now())
      `,
      [lightId, memberId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};

const deleteLightScrap = async(lightId, memberId) => {
  let client;

  const log = `scrapDao.deleteLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      DELETE FROM scrap 
      WHERE light_id = $1 AND member_id = $2
      `,
      [lightId, memberId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getLightScrap = async(lightId, memberId) => {
  let client;

  const log = `scrapDao.getLightScrap | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const { rows } = await client.query(
      `
      SELECT * FROM scrap 
      WHERE light_id = $1 and member_id = $2
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getLightScrapMember = async(lightId, memberId) => {
  let client;

  const log = `scrapDao.getLightScrapMember | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const { rows } = await client.query(
      `
      select * from scrap
      where light_id = $1 and member_id = $2;
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
module.exports = {
    addLightScrap,
    deleteLightScrap,
    getLightScrap,
    getLightScrapMember
};
