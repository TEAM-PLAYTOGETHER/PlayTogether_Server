const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE

// READ
const getUserById = async (client, userId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM "user"
      WHERE id = $1
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.getUserById에서 오류 발생: ' + error);
  }
};

const getUserByUserLoginId = async (client, userLoginId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM "user"
      WHERE user_login_id = $1
      `,
      [userLoginId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.getUserByLoginId에서 오류 발생: ' + error);
  }
};

// UPDATE
const updateUserMbti = async (client, userId, mbit) => {
  try {
    const { rows } = await client.query(
      `
    UPDATE "user"
    SET mbti = $1
    WHERE id = $2
    `,
      [mbit, userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.updateUserMbti에서 오류 발생: ' + error);
  }
};

// DELETE

module.exports = {
  getUserById,
  getUserByUserLoginId,
  updateUserMbti,
};
