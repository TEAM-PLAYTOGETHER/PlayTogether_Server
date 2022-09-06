const dayjs = require('dayjs');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE
const block = async (client, userId, memberId) => {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO "block_user" (user_id, block_user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.block에서 오류 발생: \n' + error);
  }
};

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

const getCrewUserById = async (client, crewId, memberId, userId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT u.id, u.is_deleted, nickname, description, first_station, second_station, profile_image, gender, birth
      FROM "crew_user" JOIN "user" u on u.id = crew_user.member_id
      WHERE crew_id = $1 AND member_id = $2 AND member_id NOT IN (
        SELECT block_user_id
        FROM block_user
        WHERE user_id = $3
      )
      `,
      [crewId, memberId, userId],
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

const getBlockUser = async (client, userId, memberId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM "block_user"
      WHERE user_id = $1 AND block_user_id = $2
      `,
      [userId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.getBlockUser에서 오류 발생: \n' + error);
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
      SET gender = $1, birth = $2
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
const unblock = async (client, userId, memberId) => {
  try {
    const { rows } = await client.query(
      `
      DELETE FROM "block_user"
      WHERE user_id = $1 AND block_user_id = $2
      `,
      [userId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('userDao.unblock에서 오류 발생: \n' + error);
  }
};

module.exports = {
  block,
  signup,
  getUserById,
  getCrewUserById,
  getUserBySnsId,
  getUserByNickname,
  getBlockUser,
  updateUserMbti,
  unblock,
};
