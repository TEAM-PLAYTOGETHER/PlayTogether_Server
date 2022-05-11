const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE
const createUser = async (client, userId, password, userName, gender, birth) => {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO "user" (user_login_id, password, name, gender, birth_day)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [userId, password, userName, gender, birth],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.createUser에서 오류 발생: ' + error);
  }
};

// READ

// UPDATE

// DELETE

module.exports = {
  createUser,
};
