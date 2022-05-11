const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');


const addLightScrap = async (client, lightId, memberId) => {
  try {
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
    throw new Error('ScrapDao.addLightScrap에서 에러 발생했습니다' + error);
  }
};

const deleteLightScrap = async(client, lightId, memberId) => {
  try {
    await client.query(
      `
      DELETE FROM scrap 
      WHERE light_id = $1 AND member_id = $2
      `,
      [lightId, memberId],
    );
  } catch (error) {
    throw new Error('ScrapDao.deleteLightScrap 에러 발생했습니다' + error);
  }
};
const getLightScrap = async(client, lightId, memberId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM scrap 
      WHERE light_id = $1 and member_id = $2
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('ScrapDao.getLightScrap 에러 발생했습니다' + error);
  } 
};
const getLightScrapMember = async(client, lightId, memberId) => {
  try {
    const { rows } = await client.query(
      `
      select * from scrap
      where light_id = $1 and member_id = $2;
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('ScrapDao.getLightScrapMember 에러 발생했습니다' + error);
  }
};
module.exports = {
    addLightScrap,
    deleteLightScrap,
    getLightScrap,
    getLightScrapMember
};
