const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');
const db = require('../loaders/db');

const postEnterLight = async (lightId, memberId) => {
  let client;

  const log = `lightDao.postEnterLight | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      INSERT INTO light_user
      (light_id, member_id, created_at, updated_at)
      VALUES
      ($1, $2, now(), now())
      `,
      [lightId, memberId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};
const getEnterLightMember = async(lightId, memberId) => {
  let client;

  const log = `lightDao.getEnterLightMember | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const { rows } = await client.query(
      `
      SELECT * FROM light_user 
      WHERE light_id = $1 and member_id = $2
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};
const deleteCancelLight = async(lightId, memberId) => {
  let client;

  const log = `lightDao.deleteCancelLight | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      DELETE FROM light_user 
      WHERE light_id = $1 AND member_id = $2
      `,
      [lightId, memberId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};

module.exports = {
    postEnterLight,
    getEnterLightMember,
    deleteCancelLight
};
