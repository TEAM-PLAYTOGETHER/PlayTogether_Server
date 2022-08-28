const dayjs = require('dayjs');
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
    throw new Error('userDao.getUserById에서 오류 발생: \n' + error);
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
    throw new Error('userDao.getUserByLoginId에서 오류 발생: \n' + error);
  }
};

const getUserBySnsId = async (client, snsId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM "user"
      WHERE sns_id = $1
      `,
      [snsId],
    );

    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.getUserBySnsId에서 오류 발생: \n' + error);
  }
};

const getUserByNickname = async (client, crewId, nickname) => {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM "crew_user"
      WHERE crew_id = $1 AND nickname = $2
      `,
      [crewId, nickname],
    );

    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.getUserByNickname에서 오류 발생: \n' + error);
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
    throw new Error('userDao.updateUserMbti에서 오류 발생: \n' + error);
  }
};

const signup = async (client, userId, gender, birth) => {
  let birthDay = dayjs(birth).format();
  try {
    const { rows } = await client.query(
      `
      UPDATE "user"
      SET gender = $1, birth_day = $2
      WHERE id = $3
      `,
      [gender, birthDay, userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.signup에서 오류 발생: \n' + error);
  }
};

// DELETE

module.exports = {
  signup,
  getUserById,
  getUserByUserLoginId,
  getUserBySnsId,
  getUserByNickname,
  updateUserMbti,
};
