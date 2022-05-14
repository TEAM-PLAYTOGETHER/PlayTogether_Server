const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');

const postEnterLight = async (client, lightId, memberId) => {
  try {
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
    throw new Error('lightUserdao.postEnterLight에서 에러 발생했습니다' + error);
  }
};
const getEnterLightMember = async(client, lightId, memberId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM light_user 
      WHERE light_id = $1 and member_id = $2
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('lightUserdao.getEnterLightMember에서 에러 발생했습니다' + error);
  }
};
const deleteCancelLight = async(client, lightId, memberId) => {
  try {
    await client.query(
      `
      DELETE FROM light_user 
      WHERE light_id = $1 AND member_id = $2
      `,
      [lightId, memberId],
    );
  } catch (error) {
    throw new Error('lightUserdao.deleteCancelLight에서 에러 발생했습니다' + error);
  }
};

const deleteLightUser = async(client, lightId) => {
  try {
    await client.query(
      `
      DELETE FROM light_user 
      WHERE light_id = $1
      `,
      [lightId],
    );
  } catch (error) {
    throw new Error('lightUserdao.deleteLightUser에서 에러 발생했습니다' + error);
  }
};

module.exports = {
    postEnterLight,
    getEnterLightMember,
    deleteCancelLight,
    deleteLightUser
};
