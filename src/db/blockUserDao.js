const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE

// READ
const getBlockUsers = async (client, userId, blockUserId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT block_user_id
      FROM block_user
      WHERE user_id = $1 AND block_user_id = $2
      `,
      [userId, blockUserId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('blockUserDao.getBlockUser에서 오류 발생: \n' + error);
  }
};

// UPDATE

// DELETE

module.exports = { getBlockUsers };
