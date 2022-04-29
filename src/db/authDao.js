const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE
const createUser = async (userId, password, userName, gender, birth, mbti) => {
  const client = await db.connect('로그');

  // 유저 생성 쿼리문
  const { rows } = await client.query(
    `
      INSERT INTO "user" (user_login_id, password, name, gender, birth_day, mbti)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
    [userId, password, userName, gender, birth, mbti],
  );
  client.release();
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// READ

// UPDATE

// DELETE

module.exports = {
  createUser,
};
