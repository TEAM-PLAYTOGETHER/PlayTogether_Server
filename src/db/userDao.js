const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE

// READ
const getUserById = async (userId) => {
  const client = await db.connect('로그');

  // 유저 아이디로 유저 조회 쿼리문
  const { rows } = await client.query(
    `
      SELECT *
      FROM "user"
      WHERE user_login_id = $1
      `,
    [userId],
  );
  client.release();
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// UPDATE

// DELETE

module.exports = {
  getUserById,
};
